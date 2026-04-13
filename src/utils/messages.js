const CATALOG = {
  es: {
    friendly: {
      added: "Listo. Registrado como hecho: {text}",
      later: "Guardado para despues: {text}",
      debt: "Deuda tecnica registrada: {text}",
      done: "Marcado como hecho: #{id}",
      notFound: "No encontre el item con id #{id}",
      emptyList: "No hay items para mostrar.",
      exportOk: "Exportacion lista en: {path}",
      configUpdated: "Configuracion actualizada.",
      configReset: "Configuracion restaurada a valores por defecto."
    },
    direct: {
      added: "Hecho agregado: {text}",
      later: "Pendiente agregado: {text}",
      debt: "Deuda registrada: {text}",
      done: "Item completado: #{id}",
      notFound: "Item no encontrado: #{id}",
      emptyList: "Sin items.",
      exportOk: "Exportado en: {path}",
      configUpdated: "Configuracion guardada.",
      configReset: "Configuracion reiniciada."
    }
  },
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
      added: "Completed added: {text}",
      later: "Later item added: {text}",
      debt: "Debt item added: {text}",
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
  const language = CATALOG[config.language] ? config.language : "es";
  const tone = CATALOG[language][config.tone] ? config.tone : "friendly";

  const template = CATALOG[language][tone][key] || key;
  return template.replace(/\{(\w+)\}/g, (_, token) => String(vars[token] ?? ""));
}
