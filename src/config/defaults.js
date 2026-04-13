import { DEFAULT_DATA_FILE } from "../utils/paths.js";

export const DEFAULT_CONFIG = {
  language: "en",
  tone: "friendly",
  exportFormat: "md",
  dataFile: DEFAULT_DATA_FILE,
  aliases: {}
};

export const SUPPORTED_LANGUAGES = ["en"];
export const SUPPORTED_TONES = ["friendly", "direct"];
export const SUPPORTED_EXPORT_FORMATS = ["json", "md"];
