import type { DraftSet } from "./llm";
import {
  deletePendingDraft,
  listPendingDrafts,
  readPendingDraft,
  sweepPendingDrafts,
  upsertPendingDraft,
} from "./draft-storage";
import type { TweetMedia } from "./twitter";

const DRAFT_TTL_MS = 60 * 60 * 1000;

export async function rememberDraft(
  set: DraftSet,
  media: TweetMedia[] = [],
): Promise<void> {
  await upsertPendingDraft({
    set,
    media,
    expiresAt: Date.now() + DRAFT_TTL_MS,
  });
}

export async function getDraft(
  id: string,
): Promise<{ set: DraftSet; media: TweetMedia[] } | null> {
  const entry = await readPendingDraft(id);
  if (!entry) return null;
  return { set: entry.set, media: entry.media };
}

export async function deleteDraft(id: string): Promise<void> {
  await deletePendingDraft(id);
}

export async function countDrafts(): Promise<number> {
  return (await listPendingDrafts()).length;
}

export function startDraftSweeper(): NodeJS.Timeout {
  return setInterval(() => void sweepPendingDrafts(), 10 * 60 * 1000);
}
