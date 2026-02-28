import { useState } from "react";
import { BackButton, PrimaryButton } from "@/features/shared";
import { AlertTriangle, Truck } from "lucide-react";
import type { CaliberDetailData } from "@/lib/types";
import type { ReactNode } from "react";

export interface ShippingAddress {
  fullName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

const RESTRICTED_STATES = ["CA", "NY", "IL", "DC", "NJ"];

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-1.5 flex items-baseline gap-1 text-xs font-medium uppercase tracking-wide"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
        {!required && (
          <span className="normal-case tracking-normal" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
            Optional
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function StepShipping({
  address,
  setAddress,
  ageVerified,
  setAgeVerified,
  caliber,
  onNext,
  onBack,
}: {
  address: ShippingAddress;
  setAddress: (a: ShippingAddress) => void;
  ageVerified: boolean;
  setAgeVerified: (v: boolean) => void;
  caliber: CaliberDetailData;
  onNext: () => void;
  onBack: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isRestricted = RESTRICTED_STATES.includes(address.state);
  const restrictedStateName = US_STATES.find((s) => s.value === address.state)?.label ?? address.state;

  const zipValid = /^\d{5}$/.test(address.zip);
  const formComplete =
    address.fullName.trim() !== "" &&
    address.address1.trim() !== "" &&
    address.city.trim() !== "" &&
    address.state !== "" &&
    zipValid &&
    ageVerified &&
    !isRestricted;

  const update = (field: keyof ShippingAddress, value: string) => {
    setAddress({ ...address, [field]: value });
  };

  const inputStyle = (hasValue: boolean) => ({
    backgroundColor: "var(--bg-tertiary)",
    border: `1.5px solid ${hasValue ? "var(--border-hover)" : "var(--border-default)"}`,
    color: "var(--text-primary)",
  });

  const inputClass = "w-full px-3.5 py-2.5 text-sm font-medium outline-none transition-none placeholder:font-normal";

  return (
    <div>
      <BackButton onClick={onBack} />

      <h2 className="mb-1 font-display text-2xl font-bold uppercase" style={{ color: "var(--text-primary)" }}>
        Shipping Information
      </h2>
      <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
        Enter the delivery address for your physical ammunition.
      </p>

      {/* Info / restricted banner */}
      {isRestricted ? (
        <div
          className="mb-6 flex gap-3 px-4 py-4"
          style={{
            backgroundColor: "rgba(231, 76, 60, 0.08)",
            borderLeft: "3px solid var(--red)",
          }}
        >
          <AlertTriangle size={18} className="mt-0.5 shrink-0" style={{ color: "var(--red)" }} />
          <div>
            <p className="font-mono text-sm font-bold uppercase tracking-widest" style={{ color: "var(--red)" }}>
              Direct shipping is not available in {restrictedStateName}.
            </p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Ammunition must be shipped to a licensed dealer. Contact support for dealer pickup options.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="mb-6 flex gap-3 px-4 py-4"
          style={{
            backgroundColor: "rgba(243, 156, 18, 0.08)",
            borderLeft: "3px solid var(--amber)",
          }}
        >
          <Truck size={18} className="mt-0.5 shrink-0" style={{ color: "var(--amber)" }} />
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Physical ammunition ships via UPS Ground to eligible U.S. addresses only.
          </p>
        </div>
      )}

      {/* Form fields */}
      <div className="flex flex-col gap-4">
        <FormField label="Full Name" required>
          <input
            type="text"
            value={address.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            placeholder="John Doe"
            className={inputClass}
            style={inputStyle(address.fullName.trim() !== "")}
          />
        </FormField>

        <FormField label="Address Line 1" required>
          <input
            type="text"
            value={address.address1}
            onChange={(e) => update("address1", e.target.value)}
            placeholder="123 Main Street"
            className={inputClass}
            style={inputStyle(address.address1.trim() !== "")}
          />
        </FormField>

        <FormField label="Address Line 2">
          <input
            type="text"
            value={address.address2}
            onChange={(e) => update("address2", e.target.value)}
            placeholder="Apt, Suite, Unit"
            className={inputClass}
            style={inputStyle(address.address2.trim() !== "")}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FormField label="City" required>
            <input
              type="text"
              value={address.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Austin"
              className={inputClass}
              style={inputStyle(address.city.trim() !== "")}
            />
          </FormField>

          <FormField label="State" required>
            <select
              value={address.state}
              onChange={(e) => update("state", e.target.value)}
              className={`${inputClass} appearance-none cursor-pointer`}
              style={{
                ...inputStyle(address.state !== ""),
                color: address.state === "" ? "var(--text-muted)" : "var(--text-primary)",
              }}
            >
              <option value="">Select</option>
              {US_STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="ZIP Code"
            required
            error={address.zip !== "" && !zipValid ? "Enter 5-digit ZIP" : undefined}
          >
            <input
              type="text"
              maxLength={5}
              value={address.zip}
              onChange={(e) => update("zip", e.target.value.replace(/\D/g, ""))}
              placeholder="78701"
              className={inputClass}
              style={inputStyle(address.zip.trim() !== "")}
            />
          </FormField>
        </div>
      </div>

      {/* Age verification checkbox */}
      <div
        className="mt-6 flex gap-3 px-4 py-3.5"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <input
          type="checkbox"
          id="age-verify"
          checked={ageVerified}
          onChange={(e) => setAgeVerified(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-brass"
        />
        <label
          htmlFor="age-verify"
          className="cursor-pointer text-xs leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          I confirm I am 21 years or older (handgun ammunition) / 18 years or older (rifle/shotgun ammunition) and
          legally eligible to receive ammunition in my state.
        </label>
      </div>

      {saveError && (
        <p className="mt-2 text-xs" style={{ color: "var(--red)" }}>
          {saveError}
        </p>
      )}

      <PrimaryButton
        disabled={!formComplete || isSaving}
        onClick={async () => {
          setIsSaving(true);
          setSaveError(null);
          try {
            const res = await fetch("/api/users/profile", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                defaultShippingName: address.fullName,
                defaultShippingLine1: address.address1,
                defaultShippingLine2: address.address2 || null,
                defaultShippingCity: address.city,
                defaultShippingState: address.state,
                defaultShippingZip: address.zip,
              }),
            });
            if (!res.ok) {
              throw new Error("Failed to save shipping address");
            }
            onNext();
          } catch {
            setSaveError("Failed to save shipping address. Please try again.");
          } finally {
            setIsSaving(false);
          }
        }}
      >
        {isSaving ? "Saving..." : "Save and Continue"}
      </PrimaryButton>
    </div>
  );
}
