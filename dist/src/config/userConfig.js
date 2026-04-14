import fs from "node:fs";
import path from "node:path";
import { DEFAULT_CONFIG } from "./defaults.js";
import { CONFIG_FILE } from "../utils/paths.js";
function safeParseJson(raw, fallback) {
    try {
        return JSON.parse(raw);
    }
    catch {
        return fallback;
    }
}
function deepMerge(base, incoming) {
    const merged = { ...base };
    for (const [key, value] of Object.entries(incoming || {})) {
        if (value &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            typeof base[key] === "object" &&
            !Array.isArray(base[key])) {
            merged[key] = deepMerge(base[key], value);
        }
        else {
            merged[key] = value;
        }
    }
    return merged;
}
function setByPath(target, keyPath, value) {
    const keys = keyPath.split(".").map((part) => part.trim()).filter(Boolean);
    if (keys.length === 0) {
        return target;
    }
    const output = { ...target };
    let cursor = output;
    for (let i = 0; i < keys.length - 1; i += 1) {
        const key = keys[i];
        cursor[key] = typeof cursor[key] === "object" && cursor[key] !== null ? { ...cursor[key] } : {};
        cursor = cursor[key];
    }
    cursor[keys[keys.length - 1]] = value;
    return output;
}
export function getUserConfigPath() {
    return CONFIG_FILE;
}
export function ensureUserConfig() {
    const configPath = getUserConfigPath();
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    if (!fs.existsSync(configPath)) {
        writeUserConfig(DEFAULT_CONFIG);
    }
}
export function readUserConfig() {
    ensureUserConfig();
    const raw = fs.readFileSync(getUserConfigPath(), "utf8");
    const parsed = safeParseJson(raw, null);
    if (!parsed) {
        const corruptFile = `${getUserConfigPath()}.corrupt.${Date.now()}`;
        fs.renameSync(getUserConfigPath(), corruptFile);
        writeUserConfig(DEFAULT_CONFIG);
        return { ...DEFAULT_CONFIG };
    }
    return deepMerge(DEFAULT_CONFIG, parsed);
}
export function writeUserConfig(config) {
    const payload = deepMerge(DEFAULT_CONFIG, config);
    const serialized = `${JSON.stringify(payload, null, 2)}\n`;
    fs.writeFileSync(getUserConfigPath(), serialized, "utf8");
    return payload;
}
export function updateUserConfig(partialConfig) {
    const current = readUserConfig();
    const next = deepMerge(current, partialConfig);
    return writeUserConfig(next);
}
export function setUserConfigValue(keyPath, value) {
    const current = readUserConfig();
    const next = setByPath(current, keyPath, value);
    return writeUserConfig(next);
}
export function resetUserConfig() {
    return writeUserConfig(DEFAULT_CONFIG);
}
