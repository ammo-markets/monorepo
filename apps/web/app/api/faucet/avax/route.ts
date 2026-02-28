import { parseEther } from "viem";
import { requireSession } from "@/lib/auth";
import { publicClient, faucetWalletClient } from "@/lib/viem";

const DRIP_AMOUNT = parseEther("0.05");

export async function POST() {
  try {
    if (!faucetWalletClient) {
      return Response.json({ error: "Faucet not configured" }, { status: 503 });
    }

    const session = await requireSession();
    const address = session.address as `0x${string}`;

    const balance = await publicClient.getBalance({ address });

    if (balance > BigInt(0)) {
      return Response.json(
        { message: "Wallet already has AVAX" },
        { status: 400 },
      );
    }

    const hash = await faucetWalletClient.sendTransaction({
      to: address,
      value: DRIP_AMOUNT,
    });

    return Response.json({ hash });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("AVAX faucet error:", error);
    return Response.json({ error: "Failed to send AVAX" }, { status: 500 });
  }
}
