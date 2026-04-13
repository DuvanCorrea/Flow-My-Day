import { spawnSync } from "node:child_process";

const NPM_CMD = process.platform === "win32" ? "npm.cmd" : "npm";

function parseNpmJsonOutput(raw) {
  const text = String(raw || "").trim();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    // Fall through and try to recover JSON payload from mixed output.
  }

  const arrayStart = text.indexOf("[");
  if (arrayStart >= 0) {
    const candidate = text.slice(arrayStart);
    try {
      return JSON.parse(candidate);
    } catch {
      // Ignore and continue fallback attempts.
    }
  }

  const quoteStart = text.indexOf('"');
  if (quoteStart >= 0) {
    const candidate = text.slice(quoteStart);
    try {
      return JSON.parse(candidate);
    } catch {
      // Ignore and return null.
    }
  }

  return null;
}

function runNpm(args, options = {}) {
  return spawnSync(NPM_CMD, args, {
    encoding: "utf8",
    stdio: "pipe",
    ...options
  });
}

function normalizeVersions(value) {
  if (Array.isArray(value)) {
    return value.map((version) => String(version));
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
}

function formatNpmError(result) {
  const stderr = String(result.stderr || "").trim();
  const stdout = String(result.stdout || "").trim();

  if (stderr) return stderr;
  if (stdout) return stdout;
  return `npm exited with code ${result.status ?? "unknown"}`;
}

export function getAvailableVersions(packageName) {
  const result = runNpm(["view", packageName, "versions", "--json"]);
  if (result.status !== 0) {
    throw new Error(formatNpmError(result));
  }

  const parsed = parseNpmJsonOutput(result.stdout);
  const versions = normalizeVersions(parsed);
  const latestVersion = versions.length ? versions[versions.length - 1] : null;

  return { versions, latestVersion };
}

export function installGlobalVersion(packageName, version) {
  const result = runNpm(["install", "-g", `${packageName}@${version}`]);
  if (result.status !== 0) {
    throw new Error(formatNpmError(result));
  }

  return { version, packageName };
}
