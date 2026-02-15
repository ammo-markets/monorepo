"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Check,
  MapPin,
  Shield,
  Loader2,
  Pencil,
  Wallet,
} from "lucide-react";
import { useSiwe } from "@/hooks/use-siwe";

/* ── Types ── */

interface ProfileData {
  walletAddress: string;
  kycStatus: string;
  defaultShippingName: string | null;
  defaultShippingLine1: string | null;
  defaultShippingLine2: string | null;
  defaultShippingCity: string | null;
  defaultShippingState: string | null;
  defaultShippingZip: string | null;
}

interface AddressForm {
  defaultShippingName: string;
  defaultShippingLine1: string;
  defaultShippingLine2: string;
  defaultShippingCity: string;
  defaultShippingState: string;
  defaultShippingZip: string;
}

/* ── US States ── */

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

/* ── KYC Badge Config ── */

function getKycBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return {
        label: "Verified",
        bg: "rgba(46, 204, 113, 0.15)",
        color: "var(--green)",
      };
    case "PENDING":
      return {
        label: "Pending",
        bg: "rgba(243, 156, 18, 0.15)",
        color: "var(--amber)",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        bg: "rgba(231, 76, 60, 0.15)",
        color: "var(--red)",
      };
    default:
      return {
        label: "Not Verified",
        bg: "var(--bg-tertiary)",
        color: "var(--text-muted)",
      };
  }
}

/* ── Helpers ── */

const emptyForm: AddressForm = {
  defaultShippingName: "",
  defaultShippingLine1: "",
  defaultShippingLine2: "",
  defaultShippingCity: "",
  defaultShippingState: "",
  defaultShippingZip: "",
};

function profileToForm(profile: ProfileData): AddressForm {
  return {
    defaultShippingName: profile.defaultShippingName ?? "",
    defaultShippingLine1: profile.defaultShippingLine1 ?? "",
    defaultShippingLine2: profile.defaultShippingLine2 ?? "",
    defaultShippingCity: profile.defaultShippingCity ?? "",
    defaultShippingState: profile.defaultShippingState ?? "",
    defaultShippingZip: profile.defaultShippingZip ?? "",
  };
}

/* ── Page Component ── */

export default function ProfilePage() {
  const router = useRouter();
  const { isSignedIn, isSessionLoading } = useSiwe();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Address editing
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Auth guard: wait for session check, then redirect if not signed in
  useEffect(() => {
    if (!isSessionLoading && !isSignedIn) {
      router.push("/");
    }
  }, [isSessionLoading, isSignedIn, router]);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/users/profile");
      if (!res.ok) return;
      const data: ProfileData = await res.json();
      setProfile(data);
    } catch {
      // Silently fail -- user will see empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      fetchProfile();
    }
  }, [isSignedIn, fetchProfile]);

  // Copy wallet address
  const handleCopy = useCallback(() => {
    if (!profile?.walletAddress) return;
    navigator.clipboard.writeText(profile.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [profile?.walletAddress]);

  // Open edit mode
  const openEdit = useCallback(() => {
    if (profile) {
      setForm(profileToForm(profile));
    } else {
      setForm(emptyForm);
    }
    setSaveError(null);
    setEditing(true);
  }, [profile]);

  // Save address
  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setSaveError(data?.error ?? "Failed to save address");
        return;
      }

      const updated: ProfileData = await res.json();
      setProfile(updated);
      setEditing(false);
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [form]);

  // Update form field
  const updateField = (field: keyof AddressForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* ── Loading / Auth States ── */

  if (isSessionLoading || (isSignedIn && loading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: "var(--text-muted)" }}
        />
      </div>
    );
  }

  if (!isSignedIn || !profile) {
    return null;
  }

  /* ── Derived ── */

  const badge = getKycBadge(profile.kycStatus);
  const hasAddress = profile.defaultShippingName !== null;

  const inputClass =
    "w-full rounded-lg px-3.5 py-2.5 text-sm font-medium outline-none transition-colors duration-150 placeholder:font-normal";

  const inputStyle = (hasValue: boolean) => ({
    backgroundColor: "var(--bg-tertiary)",
    border: `1.5px solid ${hasValue ? "var(--border-hover)" : "var(--border-default)"}`,
    color: "var(--text-primary)",
  });

  /* ── Render ── */

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1
        className="text-2xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        Profile
      </h1>
      <p className="mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
        Manage your account settings
      </p>

      <div className="flex flex-col gap-6">
        {/* ── Section A: Wallet ── */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Wallet size={16} style={{ color: "var(--text-muted)" }} />
            <h2
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Wallet
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="flex-1 truncate font-mono text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {profile.walletAddress}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-150"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                color: copied ? "var(--green)" : "var(--text-secondary)",
              }}
              aria-label="Copy wallet address"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* ── Section B: KYC Status ── */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Shield size={16} style={{ color: "var(--text-muted)" }} />
            <h2
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Identity Verification
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: badge.bg, color: badge.color }}
            >
              {badge.label}
            </span>
            {profile.kycStatus !== "APPROVED" && (
              <a
                href="/redeem"
                className="text-xs font-medium transition-opacity duration-150 hover:opacity-80"
                style={{ color: "var(--brass)" }}
              >
                Complete verification &rarr;
              </a>
            )}
          </div>
        </div>

        {/* ── Section C: Shipping Address ── */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <MapPin size={16} style={{ color: "var(--text-muted)" }} />
            <h2
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Default Shipping Address
            </h2>
          </div>

          {editing ? (
            /* ── Edit Mode ── */
            <div className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--text-muted)" }}
                >
                  Full Name <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.defaultShippingName}
                  onChange={(e) =>
                    updateField("defaultShippingName", e.target.value)
                  }
                  placeholder="John Doe"
                  className={inputClass}
                  style={inputStyle(form.defaultShippingName.trim() !== "")}
                />
              </div>

              {/* Line 1 */}
              <div>
                <label
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--text-muted)" }}
                >
                  Address Line 1 <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.defaultShippingLine1}
                  onChange={(e) =>
                    updateField("defaultShippingLine1", e.target.value)
                  }
                  placeholder="123 Main St"
                  className={inputClass}
                  style={inputStyle(form.defaultShippingLine1.trim() !== "")}
                />
              </div>

              {/* Line 2 */}
              <div>
                <label
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--text-muted)" }}
                >
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={form.defaultShippingLine2}
                  onChange={(e) =>
                    updateField("defaultShippingLine2", e.target.value)
                  }
                  placeholder="Apt 4B"
                  className={inputClass}
                  style={inputStyle(form.defaultShippingLine2.trim() !== "")}
                />
              </div>

              {/* City + State + ZIP row */}
              <div className="grid grid-cols-6 gap-3">
                <div className="col-span-3">
                  <label
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    City <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.defaultShippingCity}
                    onChange={(e) =>
                      updateField("defaultShippingCity", e.target.value)
                    }
                    placeholder="Austin"
                    className={inputClass}
                    style={inputStyle(form.defaultShippingCity.trim() !== "")}
                  />
                </div>
                <div className="col-span-1">
                  <label
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    State <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <select
                    value={form.defaultShippingState}
                    onChange={(e) =>
                      updateField("defaultShippingState", e.target.value)
                    }
                    className={inputClass}
                    style={inputStyle(form.defaultShippingState !== "")}
                  >
                    <option value="">--</option>
                    {US_STATES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.value}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ZIP <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={form.defaultShippingZip}
                    onChange={(e) =>
                      updateField(
                        "defaultShippingZip",
                        e.target.value.replace(/[^\d-]/g, ""),
                      )
                    }
                    placeholder="78701"
                    className={inputClass}
                    style={inputStyle(form.defaultShippingZip.trim() !== "")}
                  />
                </div>
              </div>

              {saveError && (
                <p className="text-xs" style={{ color: "var(--red)" }}>
                  {saveError}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--brass)",
                    color: "var(--bg-primary)",
                  }}
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : hasAddress ? (
            /* ── Display Mode ── */
            <div className="flex items-start justify-between">
              <div
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-primary)" }}
              >
                <div className="font-medium">
                  {profile.defaultShippingName}
                </div>
                <div>{profile.defaultShippingLine1}</div>
                {profile.defaultShippingLine2 && (
                  <div>{profile.defaultShippingLine2}</div>
                )}
                <div>
                  {profile.defaultShippingCity},{" "}
                  {profile.defaultShippingState}{" "}
                  {profile.defaultShippingZip}
                </div>
              </div>
              <button
                type="button"
                onClick={openEdit}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-150"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                }}
                aria-label="Edit address"
              >
                <Pencil size={14} />
              </button>
            </div>
          ) : (
            /* ── Empty State ── */
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No default address saved
              </p>
              <button
                type="button"
                onClick={openEdit}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition-opacity duration-150 hover:opacity-90"
                style={{
                  backgroundColor: "var(--brass)",
                  color: "var(--bg-primary)",
                }}
              >
                Add Address
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
