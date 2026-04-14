import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import dayjs from "dayjs";
import { APP_DIR } from "./paths.js";
import { readUserConfig } from "../config/userConfig.js";
import { t } from "./messages.js";

let hasHandledFatalError = false;

interface RuntimeConfig {
  language: string;
  tone: string;
}

interface ErrorMeta {
  source?: string;
  argv?: string[];
  cwd?: string;
  [key: string]: unknown;
}

function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }

  return new Error(String(value));
}

function getFallbackConfig(): RuntimeConfig {
  return {
    language: "en",
    tone: "friendly"
  };
}

function getSafeConfig(): RuntimeConfig {
  try {
    return readUserConfig();
  } catch {
    return getFallbackConfig();
  }
}

function buildLogPayload(error: unknown, meta: ErrorMeta = {}): string {
  const details = toError(error);
  const commandArgs = Array.isArray(meta.argv) ? meta.argv : process.argv;

  const lines = [];
  lines.push(`Timestamp: ${new Date().toISOString()}`);
  lines.push(`Source: ${meta.source || "unknown"}`);
  lines.push(`Command: ${commandArgs.join(" ")}`);
  lines.push(`CWD: ${meta.cwd || process.cwd()}`);
  lines.push(`Node: ${process.version}`);
  lines.push(`Platform: ${process.platform} ${process.arch}`);
  lines.push(`Error: ${details.name}: ${details.message}`);
  lines.push("");
  lines.push("Stack:");
  lines.push(details.stack || "(no stack available)");

  const context: Record<string, unknown> = { ...meta };
  delete context["source"];
  delete context["argv"];
  delete context["cwd"];

  if (Object.keys(context).length) {
    lines.push("");
    lines.push("Context:");
    lines.push(JSON.stringify(context, null, 2));
  }

  return `${lines.join("\n")}\n`;
}

export function writeErrorLog(error: unknown, meta: ErrorMeta = {}): string {
  const logsDir = path.join(APP_DIR, "logs");
  fs.mkdirSync(logsDir, { recursive: true });

  const filename = `error-${dayjs().format("YYYYMMDD-HHmmss")}.log`;
  const logPath = path.join(logsDir, filename);

  const payload = buildLogPayload(error, meta);
  fs.writeFileSync(logPath, payload, "utf8");

  return logPath;
}

export function reportHandledError(error: unknown, meta: ErrorMeta = {}): string {
  const logPath = writeErrorLog(error, meta);
  const config = getSafeConfig();
  console.error(chalk.yellow(t(config, "errorLogPath", { path: logPath })));
  return logPath;
}

export function handleFatalError(error: unknown, meta: ErrorMeta = {}): string | null {
  if (hasHandledFatalError) {
    return null;
  }

  hasHandledFatalError = true;

  const details = toError(error);
  const logPath = writeErrorLog(details, meta);
  const config = getSafeConfig();

  console.error(chalk.red(t(config, "unexpectedError", { error: details.message })));
  console.error(chalk.yellow(t(config, "errorLogPath", { path: logPath })));

  process.exitCode = 1;
  return logPath;
}
