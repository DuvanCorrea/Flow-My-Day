import type { Activity } from "../../domain/activity.js";
import type { ActivityRepository } from "../../domain/repositories/activityRepository.js";

// These use cases encapsulate domain behavior for activity creation/completion.
// CLI commands should stay as thin adapters that parse input and render output.

export type CompleteDoneTargetResult =
  | { kind: "created"; item: Activity }
  | { kind: "updated"; item: Activity }
  | { kind: "invalid-id"; rawTarget: string }
  | { kind: "not-found"; id: number };

export type EditActivityResult =
  | { kind: "updated"; item: Activity }
  | { kind: "invalid-id"; rawId: number | string }
  | { kind: "empty-text" }
  | { kind: "not-found"; id: number };

function parseItemId(value: string): number | null | undefined {
  const normalized = String(value).trim();
  if (!/^[+-]?\d+$/.test(normalized)) {
    return undefined;
  }

  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function addCompletedActivity(repository: ActivityRepository, text: string, projectId: number | null = null): Activity {
  return repository.add({ type: "done", text, status: "done", projectId });
}

export function addLaterActivity(repository: ActivityRepository, text: string, projectId: number | null = null): Activity {
  return repository.add({ type: "later", text, status: "open", projectId });
}

export function addDebtActivity(repository: ActivityRepository, text: string, projectId: number | null = null): Activity {
  return repository.add({ type: "debt", text, status: "open", projectId });
}

// Resolves the dual-mode done command behavior:
// - numeric positive target => mark existing item as done
// - non-numeric target => create a new done activity directly
export function completeDoneTarget(
  repository: ActivityRepository,
  target: string,
  projectIdForCreate: number | null = null
): CompleteDoneTargetResult {
  const id = parseItemId(target);

  if (id === undefined) {
    const item = addCompletedActivity(repository, target, projectIdForCreate);
    return { kind: "created", item };
  }

  if (id === null) {
    return { kind: "invalid-id", rawTarget: target };
  }

  const item = repository.markDoneById(id);
  if (!item) {
    return { kind: "not-found", id };
  }

  return { kind: "updated", item };
}

export function editActivityText(
  repository: ActivityRepository,
  itemId: number | string,
  newText: string
): EditActivityResult {
  const id = Number(itemId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return { kind: "invalid-id", rawId: itemId };
  }

  const normalizedText = String(newText).trim();
  if (!normalizedText) {
    return { kind: "empty-text" };
  }

  const item = repository.updateTextById(id, normalizedText);
  if (!item) {
    return { kind: "not-found", id };
  }

  return { kind: "updated", item };
}
