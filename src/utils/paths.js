import os from "node:os";
import path from "node:path";

export const APP_DIR = path.join(os.homedir(), ".flow");
export const CONFIG_FILE = path.join(APP_DIR, "config.json");
export const DEFAULT_DATA_FILE = path.join(APP_DIR, "data.json");
