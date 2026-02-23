import { useMemo } from "react";

export type TxStatus<TAction extends string, TConfirming extends string> =
  | "idle"
  | "approving"
  | "approve-confirming"
  | "approved"
  | TAction
  | TConfirming
  | "confirmed"
  | "failed";

export type MintTxStatus = TxStatus<"minting", "mint-confirming">;
export type RedeemTxStatus = TxStatus<"redeeming", "redeem-confirming">;

export interface TxStateFlags {
  isActionConfirmed: boolean;
  isActionConfirming: boolean;
  isActionPending: boolean;
  isApproveConfirmed: boolean;
  isApproveConfirming: boolean;
  isApprovePending: boolean;
  approveError: Error | null;
  actionError: Error | null;
}

export function useTxStatus<
  TAction extends string,
  TConfirming extends string,
>({
  flags,
  actionStatus,
  actionConfirmingStatus,
  hasEnoughAllowance,
}: {
  flags: TxStateFlags;
  actionStatus: TAction;
  actionConfirmingStatus: TConfirming;
  hasEnoughAllowance: boolean;
}): TxStatus<TAction, TConfirming> {
  return useMemo(() => {
    if (flags.isActionConfirmed) return "confirmed";
    if (flags.isActionConfirming) return actionConfirmingStatus;
    if (flags.isActionPending) return actionStatus;
    if (hasEnoughAllowance || flags.isApproveConfirmed) return "approved";
    if (flags.isApproveConfirming) return "approve-confirming";
    if (flags.isApprovePending) return "approving";
    if (flags.approveError || flags.actionError) return "failed";
    return "idle";
  }, [
    flags.isActionConfirmed,
    flags.isActionConfirming,
    flags.isActionPending,
    flags.isApproveConfirmed,
    flags.isApproveConfirming,
    flags.isApprovePending,
    flags.approveError,
    flags.actionError,
    hasEnoughAllowance,
    actionStatus,
    actionConfirmingStatus,
  ]);
}
