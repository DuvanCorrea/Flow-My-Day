import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
// Removes ANSI escape sequences so string assertions are deterministic.
export function stripAnsi(value) {
    return String(value || "").replace(/\u001b\[[0-9;]*m/g, "");
}
// Creates an isolated HOME and CWD per test to avoid cross-test interference.
export function createSandbox(prefix = "flow-test-") {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
    const home = path.join(root, "home");
    const cwd = path.join(root, "workspace");
    fs.mkdirSync(home, { recursive: true });
    fs.mkdirSync(cwd, { recursive: true });
    return { root, home, cwd };
}
// Cleans up the temporary sandbox after each test run.
export function removeSandbox(rootPath) {
    fs.rmSync(rootPath, { recursive: true, force: true });
}
// Forces the CLI to use the sandbox home directory for ~/.flow files.
export function buildHomeEnv(homePath) {
    return {
        ...process.env,
        HOME: homePath,
        USERPROFILE: homePath
    };
}
// Executes the flow CLI as a child process and returns stdout/stderr/status.
export function runFlow(args, options = {}) {
    const { env, cwd = PROJECT_ROOT } = options;
    return spawnSync(process.execPath, [path.join(PROJECT_ROOT, "bin", "flow.js"), ...args], {
        cwd,
        env,
        encoding: "utf8"
    });
}
// Reads and parses JSON files used in assertions.
export function readJson(filePath) {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
}
