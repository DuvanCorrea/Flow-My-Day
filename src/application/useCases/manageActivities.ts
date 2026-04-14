import { addItem, markItemDone } from "../../storage/dataStore.js";
import type { Activity } from "../../domain/activity.js";

// These use cases encapsulate domain behavior for activity creation/completion.
// CLI commands should stay as thin adapters that parse input and render output.

export type CompleteDoneTargetResult =
  | { kind: "created"; item: Activity }
  | { kind: "updated"; item: Activity }
  | { kind: "invalid-id"; rawTarget: string }
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

export function addCompletedActivity(dataFile: string, text: string): Activity {
  return addItem(dataFile, { type: "done", text, status: "done" });
}

export function addLaterActivity(dataFile: string, text: string): Activity {
  return addItem(dataFile, { type: "later", text, status: "open" });
}

export function addDebtActivity(dataFile: string, text: string): Activity {
  return addItem(dataFile, { type: "debt", text, status: "open" });
}

// Resolves the dual-mode done command behavior:
// - numeric positive target => mark existing item as done
// - non-numeric target => create a new done activity directly
export function completeDoneTarget(dataFile: string, target: string): CompleteDoneTargetResult {
  const id = parseItemId(target);

  if (id === undefined) {
    const item = addCompletedActivity(dataFile, target);
    return { kind: "created", item };
  }

  if (id === null) {
    return { kind: "invalid-id", rawTarget: target };
  }

  const item = markItemDone(dataFile, id);
  if (!item) {
    return { kind: "not-found", id };
  }

  return { kind: "updated", item };
}
