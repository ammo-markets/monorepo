"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Check, Wallet, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useSaveProfile } from "@/hooks/use-save-profile";
import { ConnectWalletCTA } from "@/features/shared/connect-wallet-cta";
import type { KycFormData } from "@/features/redeem/kyc-form";
import { useKycStatus, useKycSubmit } from "@/hooks/use-kyc";
import type { ProfileData, AddressForm } from "./profile-constants";
import { getKycBadge, emptyForm, profileToForm } from "./profile-constants";
import { KycSection } from "./kyc-section";
import { AddressSection } from "./address-section";

export default function ProfilePage() {
  const { isSignedIn, isSessionLoading } = useAuth();
  const {
    mutateAsync: saveProfile,
    isPending: saving,
    error: saveError,
  } = useSaveProfile<AddressForm>();

  const queryClient = useQueryClient();

  // KYC hooks
  const { data: kycData, isLoading: kycLoading } = useKycStatus(
    isSignedIn ? "connected" : undefined,
  );
  const { mutateAsync: submitKyc, isPending: kycSubmitting } = useKycSubmit();

  const handleKycSubmit = useCallback(
    async (data: KycFormData) => {
      await submitKyc(data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    [submitKyc, queryClient],
  );

  const [copied, setCopied] = useState(false);

  // Address editing
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<AddressForm>(emptyForm);

  // Fetch profile data via TanStack Query
  const { data: profile = null, isLoading: loading } =
    useQuery<ProfileData | null>({
      queryKey: ["profile"],
      queryFn: async () => {
        const res = await fetch("/api/users/profile");
        if (!res.ok) return null;
        return (await res.json()) as ProfileData;
      },
      enabled: !!isSignedIn,
    });

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
    setEditing(true);
  }, [profile]);

  // Save address
  const handleSave = useCallback(async () => {
    try {
      await saveProfile(form);
      setEditing(false);
    } catch {
      // error is captured by mutation state
    }
  }, [form, saveProfile]);

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

  if (!isSignedIn) {
    return (
      <ConnectWalletCTA
        title="Connect your wallet to view your profile"
        description="Sign in with your wallet to manage your account settings, shipping address, and verification status."
      />
    );
  }

  if (!profile) {
    return null;
  }

  /* ── Derived ── */

  const effectiveKycStatus = kycData?.kycStatus ?? profile.kycStatus;
  const kycPrefill = kycData?.kycPrefill;
  const badge = getKycBadge(effectiveKycStatus);

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
        <KycSection
          effectiveKycStatus={effectiveKycStatus}
          badge={badge}
          onKycSubmit={handleKycSubmit}
          kycSubmitting={kycSubmitting}
          kycPrefill={kycPrefill}
          rejectionReason={kycData?.rejectionReason}
          submittedAt={kycData?.submittedAt}
        />

        {/* ── Section C: Shipping Address ── */}
        <AddressSection
          profile={profile}
          editing={editing}
          form={form}
          saving={saving}
          saveError={saveError}
          onOpenEdit={openEdit}
          onSave={handleSave}
          onCancelEdit={() => setEditing(false)}
          onUpdateField={updateField}
        />
      </div>
    </div>
  );
}
