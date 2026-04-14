import { TRANSLATIONS } from "../i18n/translations.js";

export function t(config, key, vars = {}) {
  const locale = TRANSLATIONS[config.language] || TRANSLATIONS.en;
  const toneCatalog = locale.messages || TRANSLATIONS.en.messages;
  const tone = toneCatalog[config.tone] ? config.tone : "friendly";

  const template = toneCatalog[tone][key] || key;
  return template.replace(/\{(\w+)\}/g, (_, token) => String(vars[token] ?? ""));
}
