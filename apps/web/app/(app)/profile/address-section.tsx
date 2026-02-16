import { MapPin, Pencil, Loader2 } from "lucide-react";
import type { ProfileData, AddressForm } from "./profile-constants";
import { US_STATES } from "./profile-constants";

interface AddressSectionProps {
  profile: ProfileData;
  editing: boolean;
  form: AddressForm;
  saving: boolean;
  saveError: Error | null;
  onOpenEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onUpdateField: (field: keyof AddressForm, value: string) => void;
}

const inputClass =
  "w-full rounded-lg px-3.5 py-2.5 text-sm font-medium outline-none transition-colors duration-150 placeholder:font-normal";

function inputStyle(hasValue: boolean) {
  return {
    backgroundColor: "var(--bg-tertiary)",
    border: `1.5px solid ${hasValue ? "var(--border-hover)" : "var(--border-default)"}`,
    color: "var(--text-primary)",
  };
}

export function AddressSection({
  profile,
  editing,
  form,
  saving,
  saveError,
  onOpenEdit,
  onSave,
  onCancelEdit,
  onUpdateField,
}: AddressSectionProps) {
  const hasAddress = profile.defaultShippingName !== null;

  return (
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
                onUpdateField("defaultShippingName", e.target.value)
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
                onUpdateField("defaultShippingLine1", e.target.value)
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
                onUpdateField("defaultShippingLine2", e.target.value)
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
                  onUpdateField("defaultShippingCity", e.target.value)
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
                  onUpdateField("defaultShippingState", e.target.value)
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
                  onUpdateField(
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
              {saveError.message}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onSave}
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
              onClick={onCancelEdit}
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
            <div className="font-medium">{profile.defaultShippingName}</div>
            <div>{profile.defaultShippingLine1}</div>
            {profile.defaultShippingLine2 && (
              <div>{profile.defaultShippingLine2}</div>
            )}
            <div>
              {profile.defaultShippingCity}, {profile.defaultShippingState}{" "}
              {profile.defaultShippingZip}
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenEdit}
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
            onClick={onOpenEdit}
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
  );
}
