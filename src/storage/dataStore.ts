import fs from "node:fs";
import path from "node:path";
import dayjs from "dayjs";
import type {
  Activity,
  ActivityStats,
  AddActivityInput,
  FlowData,
  ListActivityOptions,
  Project
} from "../domain/activity.js";

function nowIso(): string {
  return dayjs().toISOString();
}

function getUndoFilePath(dataFile: string): string {
  return `${dataFile}.undo.json`;
}

function createInitialData(): FlowData {
  const timestamp = nowIso();

  return {
    meta: {
      version: 2,
      createdAt: timestamp,
      updatedAt: timestamp,
      nextId: 1,
      nextProjectId: 1
    },
    items: [],
    projects: []
  };
}

function ensureParentDir(filePath: string): void {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function normalizeProjectId(value: unknown): number | null {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) {
    return value;
  }

  return null;
}

function normalizeProjects(input: unknown): Project[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const seen = new Set<number>();
  const projects: Project[] = [];

  for (const entry of input) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const candidate = entry as Partial<Project>;
    const id = normalizeProjectId(candidate.id);
    const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
    if (!id || !name || seen.has(id)) {
      continue;
    }

    seen.add(id);
    projects.push({
      id,
      name,
      createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt : nowIso()
    });
  }

  return projects;
}

function normalizeActivities(input: unknown, projects: Project[]): Activity[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const validProjectIds = new Set(projects.map((project) => project.id));
  const activities: Activity[] = [];

  for (const entry of input) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const candidate = entry as Partial<Activity>;
    const id = normalizeProjectId(candidate.id);
    const type = candidate.type;
    const status = candidate.status;
    const text = typeof candidate.text === "string" ? candidate.text : "";

    if (!id || (type !== "done" && type !== "later" && type !== "debt") || (status !== "done" && status !== "open") || !text) {
      continue;
    }

    const normalizedProjectId = normalizeProjectId(candidate.projectId);
    activities.push({
      id,
      type,
      status,
      text,
      projectId: normalizedProjectId && validProjectIds.has(normalizedProjectId) ? normalizedProjectId : null,
      createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt : nowIso(),
      doneAt: typeof candidate.doneAt === "string" || candidate.doneAt === null ? candidate.doneAt : null
    });
  }

  return activities;
}

function normalizeFlowData(value: unknown): FlowData {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid data schema");
  }

  const parsed = value as Partial<FlowData>;
  const projects = normalizeProjects(parsed.projects);
  const items = normalizeActivities(parsed.items, projects);

  const maxItemId = items.reduce((max, item) => Math.max(max, item.id), 0);
  const maxProjectId = projects.reduce((max, project) => Math.max(max, project.id), 0);
  const meta: Partial<FlowData["meta"]> = parsed.meta || {};

  const nextId = typeof meta.nextId === "number" && Number.isSafeInteger(meta.nextId) && meta.nextId > maxItemId
    ? meta.nextId
    : maxItemId + 1;
  const nextProjectId = typeof meta.nextProjectId === "number" && Number.isSafeInteger(meta.nextProjectId) && meta.nextProjectId > maxProjectId
    ? meta.nextProjectId
    : maxProjectId + 1;

  return {
    meta: {
      version: typeof meta.version === "number" && Number.isSafeInteger(meta.version) ? meta.version : 2,
      createdAt: typeof meta.createdAt === "string" ? meta.createdAt : nowIso(),
      updatedAt: typeof meta.updatedAt === "string" ? meta.updatedAt : nowIso(),
      nextId,
      nextProjectId
    },
    items,
    projects
  };
}

export function ensureDataFile(dataFile: string): void {
  ensureParentDir(dataFile);

  if (!fs.existsSync(dataFile)) {
    const initial = createInitialData();
    fs.writeFileSync(dataFile, `${JSON.stringify(initial, null, 2)}\n`, "utf8");
  }
}

export function readData(dataFile: string): FlowData {
  ensureDataFile(dataFile);

  const raw = fs.readFileSync(dataFile, "utf8");

  try {
    const parsed = JSON.parse(raw) as unknown;
    return normalizeFlowData(parsed);
  } catch {
    const corruptFile = `${dataFile}.corrupt.${Date.now()}`;
    fs.renameSync(dataFile, corruptFile);
    const fallback = createInitialData();
    fs.writeFileSync(dataFile, `${JSON.stringify(fallback, null, 2)}\n`, "utf8");
    return fallback;
  }
}

export function writeData(dataFile: string, data: FlowData): FlowData {
  ensureDataFile(dataFile);
  try {
    const currentRaw = fs.readFileSync(dataFile, "utf8");
    const current = normalizeFlowData(JSON.parse(currentRaw));
    fs.writeFileSync(getUndoFilePath(dataFile), `${JSON.stringify(current, null, 2)}\n`, "utf8");
  } catch {
    // Ignore snapshot failures and continue writing the new payload.
  }

  const payload: FlowData = {
    ...data,
    meta: {
      ...data.meta,
      updatedAt: nowIso()
    }
  };

  fs.writeFileSync(dataFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}

export function addItem(dataFile: string, { type, text, status, projectId }: AddActivityInput): Activity {
  const data = readData(dataFile);
  const hasProject = typeof projectId === "number"
    && data.projects.some((project) => project.id === projectId);
  const normalizedProjectId = hasProject ? projectId ?? null : null;
  const item: Activity = {
    id: data.meta.nextId,
    type,
    text,
    status,
    projectId: normalizedProjectId,
    createdAt: nowIso(),
    doneAt: status === "done" ? nowIso() : null
  };

  data.meta.nextId += 1;
  data.items.unshift(item);

  writeData(dataFile, data);
  return item;
}

export function markItemDone(dataFile: string, itemId: number | string): Activity | null {
  const data = readData(dataFile);
  const id = Number(itemId);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const item = data.items.find((entry) => entry.id === id);

  if (!item) {
    return null;
  }

  item.type = "done";
  item.status = "done";
  item.doneAt = nowIso();

  writeData(dataFile, data);
  return item;
}

export function updateItemText(dataFile: string, itemId: number | string, newText: string): Activity | null {
  const data = readData(dataFile);
  const id = Number(itemId);
  const normalizedText = String(newText).trim();

  if (!Number.isInteger(id) || id <= 0 || !normalizedText) {
    return null;
  }

  const item = data.items.find((entry) => entry.id === id);
  if (!item) {
    return null;
  }

  item.text = normalizedText;
  writeData(dataFile, data);
  return item;
}

export function deleteItem(dataFile: string, itemId: number | string): Activity | null {
  const data = readData(dataFile);
  const id = Number(itemId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const index = data.items.findIndex((entry) => entry.id === id);
  if (index < 0) {
    return null;
  }

  const [deletedItem] = data.items.splice(index, 1);
  writeData(dataFile, data);
  return deletedItem;
}

export function listItems(dataFile: string, options: ListActivityOptions = {}): Activity[] {
  const { type = "all", status = "all", limit } = options;
  const data = readData(dataFile);

  const filtered = data.items.filter((item) => {
    const typeMatch = type === "all" || item.type === type;
    const statusMatch = status === "all" || item.status === status;
    return typeMatch && statusMatch;
  });

  if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
    return filtered.slice(0, limit);
  }

  return filtered;
}

export function getStats(dataFile: string): ActivityStats {
  const data = readData(dataFile);
  const stats: ActivityStats = {
    total: data.items.length,
    done: 0,
    open: 0,
    byType: {
      done: 0,
      later: 0,
      debt: 0
    }
  };

  for (const item of data.items) {
    if (item.status === "done") {
      stats.done += 1;
    } else {
      stats.open += 1;
    }

    if (item.type === "done" || item.type === "later" || item.type === "debt") {
      stats.byType[item.type] += 1;
    }
  }

  return stats;
}

export function listProjects(dataFile: string): Project[] {
  const data = readData(dataFile);
  return [...data.projects].sort((a, b) => a.id - b.id);
}

export function getProjectById(dataFile: string, projectId: number): Project | null {
  const data = readData(dataFile);
  return data.projects.find((project) => project.id === projectId) || null;
}

export function getProjectByName(dataFile: string, name: string): Project | null {
  const data = readData(dataFile);
  const normalizedName = name.trim().toLocaleLowerCase();
  return data.projects.find((project) => project.name.toLocaleLowerCase() === normalizedName) || null;
}

export function createProject(dataFile: string, name: string): Project {
  const data = readData(dataFile);
  const normalizedName = name.trim();

  const existing = data.projects.find(
    (project) => project.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase()
  );
  if (existing) {
    return existing;
  }

  const project: Project = {
    id: data.meta.nextProjectId,
    name: normalizedName,
    createdAt: nowIso()
  };

  data.meta.nextProjectId += 1;
  data.projects.push(project);
  writeData(dataFile, data);
  return project;
}

export function renameProject(dataFile: string, projectId: number, newName: string): Project | null {
  const data = readData(dataFile);
  const normalizedName = String(newName).trim();
  if (!normalizedName) {
    return null;
  }

  const project = data.projects.find((entry) => entry.id === projectId);
  if (!project) {
    return null;
  }

  project.name = normalizedName;
  writeData(dataFile, data);
  return project;
}

export function deleteProject(dataFile: string, projectId: number): { project: Project; orphanedItems: number } | null {
  const data = readData(dataFile);
  const index = data.projects.findIndex((project) => project.id === projectId);
  if (index < 0) {
    return null;
  }

  const [project] = data.projects.splice(index, 1);
  let orphanedItems = 0;
  for (const item of data.items) {
    if (item.projectId === projectId) {
      item.projectId = null;
      orphanedItems += 1;
    }
  }

  writeData(dataFile, data);
  return { project, orphanedItems };
}

export function restoreUndoSnapshot(dataFile: string): FlowData | null {
  ensureDataFile(dataFile);
  const undoFile = getUndoFilePath(dataFile);
  if (!fs.existsSync(undoFile)) {
    return null;
  }

  let undoData: FlowData;
  try {
    const rawUndo = fs.readFileSync(undoFile, "utf8");
    undoData = normalizeFlowData(JSON.parse(rawUndo));
  } catch {
    return null;
  }

  const currentData = readData(dataFile);
  fs.writeFileSync(undoFile, `${JSON.stringify(currentData, null, 2)}\n`, "utf8");

  const restored: FlowData = {
    ...undoData,
    meta: {
      ...undoData.meta,
      updatedAt: nowIso()
    }
  };

  fs.writeFileSync(dataFile, `${JSON.stringify(restored, null, 2)}\n`, "utf8");
  return restored;
}
