import fs from "node:fs";
import path from "node:path";
import dayjs from "dayjs";

function nowIso() {
  return dayjs().toISOString();
}

function createInitialData() {
  const timestamp = nowIso();

  return {
    meta: {
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      nextId: 1
    },
    items: []
  };
}

function ensureParentDir(filePath) {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

export function ensureDataFile(dataFile) {
  ensureParentDir(dataFile);

  if (!fs.existsSync(dataFile)) {
    const initial = createInitialData();
    fs.writeFileSync(dataFile, `${JSON.stringify(initial, null, 2)}\n`, "utf8");
  }
}

export function readData(dataFile) {
  ensureDataFile(dataFile);

  const raw = fs.readFileSync(dataFile, "utf8");

  try {
    const parsed = JSON.parse(raw);
    if (!parsed.meta || !Array.isArray(parsed.items)) {
      throw new Error("Invalid data schema");
    }

    return parsed;
  } catch {
    const corruptFile = `${dataFile}.corrupt.${Date.now()}`;
    fs.renameSync(dataFile, corruptFile);
    const fallback = createInitialData();
    fs.writeFileSync(dataFile, `${JSON.stringify(fallback, null, 2)}\n`, "utf8");
    return fallback;
  }
}

export function writeData(dataFile, data) {
  const payload = {
    ...data,
    meta: {
      ...data.meta,
      updatedAt: nowIso()
    }
  };

  fs.writeFileSync(dataFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}

export function addItem(dataFile, { type, text, status }) {
  const data = readData(dataFile);
  const item = {
    id: data.meta.nextId,
    type,
    text,
    status,
    createdAt: nowIso(),
    doneAt: status === "done" ? nowIso() : null
  };

  data.meta.nextId += 1;
  data.items.unshift(item);

  writeData(dataFile, data);
  return item;
}

export function markItemDone(dataFile, itemId) {
  const data = readData(dataFile);
  const id = Number(itemId);
  const item = data.items.find((entry) => entry.id === id);

  if (!item) {
    return null;
  }

  item.status = "done";
  item.doneAt = nowIso();

  writeData(dataFile, data);
  return item;
}

export function listItems(dataFile, options = {}) {
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

export function getStats(dataFile) {
  const data = readData(dataFile);
  const stats = {
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

    if (stats.byType[item.type] !== undefined) {
      stats.byType[item.type] += 1;
    }
  }

  return stats;
}
