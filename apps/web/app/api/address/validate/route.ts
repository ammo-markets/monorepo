import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

const addressSchema = z.object({
  name: z.string().min(1),
  street1: z.string().min(1),
  street2: z.string().optional().default(""),
  city: z.string().min(1),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}$/),
});

export interface AddressValidationResult {
  isValid: boolean;
  /** Shippo's suggested (corrected) address, if different from input */
  suggested: {
    street1: string;
    street2: string;
    city: string;
    state: string;
    zip: string;
  } | null;
  messages: string[];
}

export async function POST(req: Request) {
  const token = env.SHIPPO_API_KEY;
  if (!token) {
    // Gracefully degrade — skip validation if Shippo isn't configured
    return NextResponse.json<AddressValidationResult>({
      isValid: true,
      suggested: null,
      messages: [],
    });
  }

  const body = await req.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid address fields", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, street1, street2, city, state, zip } = parsed.data;

  try {
    const res = await fetch("https://api.goshippo.com/addresses/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        street1,
        street2,
        city,
        state,
        zip,
        country: "US",
        validate: true,
      }),
    });

    if (!res.ok) {
      console.error("Shippo API error:", res.status, await res.text());
      // Don't block the user if Shippo is down
      return NextResponse.json<AddressValidationResult>({
        isValid: true,
        suggested: null,
        messages: [],
      });
    }

    const data = await res.json();
    const validation = data.validation_results;

    if (!validation) {
      return NextResponse.json<AddressValidationResult>({
        isValid: true,
        suggested: null,
        messages: [],
      });
    }

    const isValid = validation.is_valid === true;
    const messages: string[] = (validation.messages ?? []).map(
      (m: { text: string }) => m.text,
    );

    // Build suggested address from Shippo's response if it differs
    const suggested =
      data.street1 !== street1 ||
      data.street2 !== (street2 || "") ||
      data.city !== city ||
      data.state !== state ||
      data.zip !== zip
        ? {
            street1: data.street1 as string,
            street2: (data.street2 as string) ?? "",
            city: data.city as string,
            state: data.state as string,
            zip: data.zip as string,
          }
        : null;

    return NextResponse.json<AddressValidationResult>({
      isValid,
      suggested,
      messages,
    });
  } catch (err) {
    console.error("Shippo validation failed:", err);
    return NextResponse.json<AddressValidationResult>({
      isValid: true,
      suggested: null,
      messages: [],
    });
  }
}
