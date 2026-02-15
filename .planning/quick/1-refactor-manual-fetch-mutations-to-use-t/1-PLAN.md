---
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/hooks/use-kyc.ts
  - apps/web/hooks/use-save-profile.ts
  - apps/web/features/redeem/redeem-flow.tsx
  - apps/web/app/profile/page.tsx
autonomous: true
must_haves:
  truths:
    - "KYC fetch and submit use TanStack Query hooks instead of manual fetch + useState"
    - "Profile save uses useMutation with automatic cache invalidation"
    - "All existing behavior (loading states, error handling, success transitions) is preserved"
  artifacts:
    - path: "apps/web/hooks/use-kyc.ts"
      provides: "useKycStatus query hook and useKycSubmit mutation hook"
      exports: ["useKycStatus", "useKycSubmit"]
    - path: "apps/web/hooks/use-save-profile.ts"
      provides: "useSaveProfile mutation hook"
      exports: ["useSaveProfile"]
  key_links:
    - from: "apps/web/features/redeem/redeem-flow.tsx"
      to: "apps/web/hooks/use-kyc.ts"
      via: "useKycStatus and useKycSubmit imports"
      pattern: "useKycStatus|useKycSubmit"
    - from: "apps/web/app/profile/page.tsx"
      to: "apps/web/hooks/use-save-profile.ts"
      via: "useSaveProfile import"
      pattern: "useSaveProfile"
---

<objective>
Replace all manual fetch + useState mutation patterns with TanStack Query useMutation hooks across the redeem flow and profile page.

Purpose: Eliminate hand-rolled loading/error state management in favor of TanStack Query's built-in mutation lifecycle, improving consistency and reducing boilerplate.
Output: Two new hooks (use-kyc.ts, use-save-profile.ts) and updated consumer components.
</objective>

<context>
@apps/web/features/redeem/redeem-flow.tsx
@apps/web/app/profile/page.tsx
@apps/web/hooks/use-market-data.ts (existing useQuery pattern reference)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create KYC query and mutation hooks</name>
  <files>apps/web/hooks/use-kyc.ts</files>
  <action>
Create `apps/web/hooks/use-kyc.ts` with two hooks:

1. `useKycStatus(walletAddress: string | undefined)` -- uses `useQuery`:
   - queryKey: `["kyc", walletAddress]`
   - queryFn: fetches `GET /api/users/kyc`, returns `{ kycStatus, kycPrefill }` where kycPrefill has shape `{ fullName, dateOfBirth, state, govIdType, govIdNumber }` (all `string | null`)
   - `enabled: !!walletAddress`
   - On fetch error, return `{ kycStatus: "NONE", kycPrefill: undefined }` (matches current catch behavior on line 1755-1757)
   - Transform the dateOfBirth to `YYYY-MM-DD` string format in the queryFn (matches current line 1748 logic)

2. `useKycSubmit()` -- uses `useMutation`:
   - mutationFn: POSTs to `/api/users/kyc` with JSON body, returns parsed JSON
   - On success: invalidate `["kyc"]` queries via `queryClient.invalidateQueries`
   - Return the mutation object so consumers get `mutate`, `isPending`, `isError`, `error`, `data`

Use `import type` for type-only imports per project conventions. Import `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`.
  </action>
  <verify>
Run `pnpm --filter @ammo-exchange/web check` -- no type errors in the new file.
  </verify>
  <done>
`use-kyc.ts` exports both hooks, types check clean.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create profile save mutation hook and refactor both consumers</name>
  <files>apps/web/hooks/use-save-profile.ts, apps/web/features/redeem/redeem-flow.tsx, apps/web/app/profile/page.tsx</files>
  <action>
**A) Create `apps/web/hooks/use-save-profile.ts`:**

`useSaveProfile()` -- uses `useMutation`:
- mutationFn: PATCHes `/api/users/profile` with JSON body. If `!res.ok`, parse error body and throw `new Error(data?.error ?? "Failed to save address")` so TanStack catches it.
- On success: invalidate `["profile"]` queries.
- Return the mutation object.

**B) Refactor `apps/web/features/redeem/redeem-flow.tsx` (RedeemFlow orchestrator):**

In the `RedeemFlow` component (line 1634+):
- Remove state: `kycStatus`, `kycLoading`, `kycPrefill` (lines 1666-1677)
- Remove the KYC fetch useEffect (lines 1738-1761)
- Remove `handleKycSubmit` useCallback (lines 1775-1794)
- Import and use `useKycStatus(wallet.address)` -- destructure `{ data: kycData, isLoading: kycLoading }`
- Derive `kycStatus` as `kycData?.kycStatus ?? "NONE"` and `kycPrefill` as `kycData?.kycPrefill`
- Import and use `useKycSubmit()` -- destructure `{ mutateAsync: submitKyc, isPending: kycSubmitting }`
- Pass `kycSubmitting` (not `kycLoading`) as `kycLoading` prop to `StepKyc` for the submit button state
- The KYC fetch loading should use `kycLoading` from useQuery for the initial load indicator
- Replace `handleKycSubmit` with: `const handleKycSubmit = useCallback(async (data: KycFormData) => { await submitKyc(data); }, [submitKyc]);`
- The auto-skip useEffect (lines 1765-1773) should still work since it reads kycStatus which is now derived from the query data
- IMPORTANT: The `step === 2` guard for fetching is no longer needed since useQuery with `enabled: !!wallet.address` handles this. The query fetches once on mount when wallet is connected. This is actually better -- data is pre-fetched before the user reaches step 2.

**C) Refactor `apps/web/app/profile/page.tsx`:**

- Remove state: `saving`, `saveError` (lines 161-162)
- Import and use `useSaveProfile()` -- destructure `{ mutateAsync: saveProfile, isPending: saving, error: saveError }`
- Replace `handleSave` (lines 202-226):
  ```
  const handleSave = useCallback(async () => {
    try {
      await saveProfile(form);
      setEditing(false);
    } catch {
      // error is captured by mutation state
    }
  }, [form, saveProfile]);
  ```
- Remove `queryClient` usage (line 154) since invalidation is handled inside the hook. Actually keep `useQueryClient` only if other code uses it -- in this file it's only used for profile invalidation, so remove it.
- Update the error display: `saveError` from mutation is an Error object, so render `saveError?.message` instead of `saveError` directly (line 519).
- The `saving` boolean from `isPending` replaces the manual `setSaving` pattern.
- Remove `setSaving(true)`, `setSaving(false)`, `setSaveError(null)`, `setSaveError(...)` calls.
  </action>
  <verify>
Run `pnpm --filter @ammo-exchange/web check` -- no type errors across all modified files.
Run `pnpm --filter @ammo-exchange/web build` -- build succeeds with no errors.
  </verify>
  <done>
All three manual fetch mutation patterns replaced with useMutation hooks. No manual loading/error useState for mutations remains. Profile page no longer imports useQueryClient directly. KYC status is fetched via useQuery. All type checks pass and build succeeds.
  </done>
</task>

</tasks>

<verification>
1. `pnpm --filter @ammo-exchange/web check` passes with zero errors
2. `pnpm --filter @ammo-exchange/web build` succeeds
3. `grep -r "useState.*saving\|useState.*kycLoading\|useState.*saveError" apps/web/features/redeem/redeem-flow.tsx apps/web/app/profile/page.tsx` returns no matches (all manual mutation state removed)
4. `grep -r "useMutation" apps/web/hooks/use-kyc.ts apps/web/hooks/use-save-profile.ts` returns matches in both files
</verification>

<success_criteria>
- Zero manual fetch + useState mutation patterns remain in redeem-flow.tsx and profile/page.tsx
- Two new hooks created following existing project hook conventions
- All loading, error, and success behaviors preserved (loading spinners, error messages, cache invalidation, navigation on success)
- TypeScript strict mode passes, build succeeds
</success_criteria>
