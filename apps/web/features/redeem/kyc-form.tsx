"use client";

import { useState } from "react";
import { Shield, Loader2 } from "lucide-react";
import { US_STATES } from "@/lib/us-states";

const GOV_ID_TYPES = [
  { value: "DRIVERS_LICENSE", label: "Driver's License" },
  { value: "PASSPORT", label: "Passport" },
  { value: "STATE_ID", label: "State ID" },
];

export interface KycFormData {
  fullName: string;
  dateOfBirth: string;
  state: string;
  govIdType: string;
  govIdNumber: string;
}

interface KycFormProps {
  onSubmit: (data: KycFormData) => Promise<void>;
  isSubmitting: boolean;
  prefill?: {
    fullName?: string | null;
    dateOfBirth?: string | null;
    state?: string | null;
    govIdType?: string | null;
    govIdNumber?: string | null;
  };
}

export function KycForm({ onSubmit, isSubmitting, prefill }: KycFormProps) {
  const [fullName, setFullName] = useState(prefill?.fullName ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(prefill?.dateOfBirth ?? "");
  const [state, setState] = useState(prefill?.state ?? "");
  const [govIdType, setGovIdType] = useState(prefill?.govIdType ?? "");
  const [govIdNumber, setGovIdNumber] = useState(prefill?.govIdNumber ?? "");
  const [errors, setErrors] = useState<
    Partial<Record<keyof KycFormData, string>>
  >({});

  function validate(): boolean {
    const newErrors: Partial<Record<keyof KycFormData, string>> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const dob = new Date(dateOfBirth);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();
      const monthDiff = now.getMonth() - dob.getMonth();
      const dayDiff = now.getDate() - dob.getDate();
      const adjustedAge =
        monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      if (adjustedAge < 18) {
        newErrors.dateOfBirth = "Must be at least 18 years old";
      }
    }

    if (!state || state.length !== 2) {
      newErrors.state = "State is required";
    }

    if (!govIdType) {
      newErrors.govIdType = "Government ID type is required";
    }

    if (!govIdNumber || govIdNumber.length < 5) {
      newErrors.govIdNumber = "ID number must be at least 5 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    await onSubmit({ fullName, dateOfBirth, state, govIdType, govIdNumber });
  }

  const inputClass =
    "w-full px-3.5 py-2.5 text-sm font-medium outline-none transition-colors duration-150 placeholder:font-normal";

  const inputStyle = (hasValue: boolean) => ({
    backgroundColor: "var(--bg-tertiary)",
    border: `1.5px solid ${hasValue ? "var(--border-hover)" : "var(--border-default)"}`,
    color: "var(--text-primary)",
  });

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        {/* Full Legal Name */}
        <div>
          <label
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Full Legal Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Michael Doe"
            className={inputClass}
            style={inputStyle(fullName.trim() !== "")}
          />
          {errors.fullName && (
            <p className="mt-1 text-xs" style={{ color: "var(--red)" }}>
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Date of Birth
          </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className={inputClass}
            style={inputStyle(dateOfBirth !== "")}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-xs" style={{ color: "var(--red)" }}>
              {errors.dateOfBirth}
            </p>
          )}
        </div>

        {/* State of Residence */}
        <div>
          <label
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            State of Residence
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className={`${inputClass} appearance-none cursor-pointer`}
            style={{
              ...inputStyle(state !== ""),
              color: state === "" ? "var(--text-muted)" : "var(--text-primary)",
            }}
          >
            <option value="">Select state</option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="mt-1 text-xs" style={{ color: "var(--red)" }}>
              {errors.state}
            </p>
          )}
        </div>

        {/* Government ID Type */}
        <div>
          <label
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Government ID Type
          </label>
          <select
            value={govIdType}
            onChange={(e) => setGovIdType(e.target.value)}
            className={`${inputClass} appearance-none cursor-pointer`}
            style={{
              ...inputStyle(govIdType !== ""),
              color:
                govIdType === "" ? "var(--text-muted)" : "var(--text-primary)",
            }}
          >
            <option value="">Select ID type</option>
            {GOV_ID_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {errors.govIdType && (
            <p className="mt-1 text-xs" style={{ color: "var(--red)" }}>
              {errors.govIdType}
            </p>
          )}
        </div>

        {/* Government ID Number */}
        <div>
          <label
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Government ID Number
          </label>
          <input
            type="text"
            value={govIdNumber}
            onChange={(e) => setGovIdNumber(e.target.value)}
            placeholder="e.g., D12345678"
            className={inputClass}
            style={inputStyle(govIdNumber.trim() !== "")}
          />
          {errors.govIdNumber && (
            <p className="mt-1 text-xs" style={{ color: "var(--red)" }}>
              {errors.govIdNumber}
            </p>
          )}
        </div>
      </div>

      {/* Submit button */}
      <button
        type="button"
        disabled={isSubmitting}
        onClick={handleSubmit}
        className={`mt-6 flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all duration-150 ${
          isSubmitting
            ? "cursor-not-allowed bg-ax-tertiary text-text-muted opacity-50"
            : "cursor-pointer bg-brass text-ax-primary hover:bg-brass-hover"
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Shield size={16} />
            Submit Verification
          </>
        )}
      </button>
    </div>
  );
}
