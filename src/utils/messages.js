const CATALOG = {
  en: {
    friendly: {
      added: "Done. Logged as completed: {text}",
      later: "Saved for later: {text}",
      debt: "Technical debt logged: {text}",
      done: "Marked as done: #{id}",
      notFound: "Could not find item #{id}",
      emptyList: "No items to show.",
      exportOk: "Export complete at: {path}",
      configUpdated: "Configuration updated.",
      configReset: "Configuration reset to defaults."
    },
    direct: {
      added: "Completed: {text}",
      later: "Queued for later: {text}",
      debt: "Debt logged: {text}",
      done: "Completed: #{id}",
      notFound: "Item not found: #{id}",
      emptyList: "No items.",
      exportOk: "Exported to: {path}",
      configUpdated: "Configuration saved.",
      configReset: "Configuration reset."
    }
  }
};

export function t(config, key, vars = {}) {
  const language = CATALOG[config.language] ? config.language : "en";
  const tone = CATALOG[language][config.tone] ? config.tone : "friendly";

  const template = CATALOG[language][tone][key] || key;
  return template.replace(/\{(\w+)\}/g, (_, token) => String(vars[token] ?? ""));
}
