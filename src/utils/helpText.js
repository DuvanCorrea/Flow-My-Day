const HELP_TEXTS = {
  en: {
    cli: {
      description: "Personal CLI to track completed work, later tasks, and technical debt",
      helpAfterError: "Use flow --help to view commands and examples.",
      versionDescription: "output the version number",
      helpOptionDescription: "display help for command",
      helpCommandDescription: "display help for command",
      helpSections: {
        usage: "Usage",
        options: "Options",
        commands: "Commands"
      },
      examplesTitle: "Examples",
      examples: [
        'flow add "Fix login bug"',
        'flow later "Write onboarding docs"',
        'flow debt "Split monolithic payment handler"',
        "flow list --status open",
        "flow done 4",
        "flow stats",
        "flow export ./reports/today.md -f md",
        "flow config set language en"
      ]
    },
    commands: {
      add: {
        description: "Log a completed task"
      },
      later: {
        description: "Log a task for later"
      },
      debt: {
        description: "Log technical debt"
      },
      list: {
        description: "List saved items",
        optionType: "Filter by type: done|later|debt|all",
        optionStatus: "Filter by status: open|done|all",
        optionLimit: "Limit number of results",
        optionJson: "Output as JSON",
        sections: {
          later: "Later",
          done: "Done",
          debt: "Tech Debt"
        },
        status: {
          done: "done",
          open: "open"
        },
        unknownTime: "unknown-time"
      },
      done: {
        description: "Mark an open item as done"
      },
      stats: {
        description: "Show quick productivity metrics",
        optionJson: "Output as JSON",
        title: "Flow Stats",
        totalLabel: "Total",
        doneLabel: "Done",
        openLabel: "Open",
        byTypeLabel: "By type",
        typeNames: {
          done: "done",
          later: "later",
          debt: "debt"
        }
      },
      export: {
        description: "Export your data to JSON or Markdown",
        optionFormat: "Export format: json|md",
        invalidFormat: "Invalid format: {format}. Use json or md."
      },
      config: {
        description: "View and update user configuration",
        getDescription: "Read a configuration value",
        setDescription: "Set a configuration value",
        resetDescription: "Restore default configuration",
        configPathLabel: "Config path",
        keyNotFound: "Key does not exist: {key}",
        validationLanguage: "language must be: {supported}",
        validationTone: "tone must be: {supported}",
        validationExportFormat: "exportFormat must be: {supported}"
      }
    }
  },
  es: {
    cli: {
      description: "CLI personal para registrar tareas hechas, pendientes y deuda tecnica",
      helpAfterError: "Usa flow --help para ver comandos y ejemplos.",
      versionDescription: "mostrar numero de version",
      helpOptionDescription: "mostrar ayuda del comando",
      helpCommandDescription: "mostrar ayuda del comando",
      helpSections: {
        usage: "Uso",
        options: "Opciones",
        commands: "Comandos"
      },
      examplesTitle: "Ejemplos",
      examples: [
        'flow add "Corregir bug de login"',
        'flow later "Escribir documentacion de onboarding"',
        'flow debt "Separar handler monolitico de pagos"',
        "flow list --status open",
        "flow done 4",
        "flow stats",
        "flow export ./reports/hoy.md -f md",
        "flow config set language es"
      ]
    },
    commands: {
      add: {
        description: "Registrar una tarea completada"
      },
      later: {
        description: "Registrar una tarea para despues"
      },
      debt: {
        description: "Registrar deuda tecnica"
      },
      list: {
        description: "Listar items guardados",
        optionType: "Filtrar por tipo: done|later|debt|all",
        optionStatus: "Filtrar por estado: open|done|all",
        optionLimit: "Limitar cantidad de resultados",
        optionJson: "Salida en JSON",
        sections: {
          later: "Pendiente",
          done: "Hecho",
          debt: "Deuda Tecnica"
        },
        status: {
          done: "hecho",
          open: "abierto"
        },
        unknownTime: "hora-desconocida"
      },
      done: {
        description: "Marcar un item abierto como hecho"
      },
      stats: {
        description: "Mostrar metricas rapidas de productividad",
        optionJson: "Salida en JSON",
        title: "Estadisticas Flow",
        totalLabel: "Total",
        doneLabel: "Hecho",
        openLabel: "Abierto",
        byTypeLabel: "Por tipo",
        typeNames: {
          done: "hecho",
          later: "pendiente",
          debt: "deuda"
        }
      },
      export: {
        description: "Exportar tus datos a JSON o Markdown",
        optionFormat: "Formato de exportacion: json|md",
        invalidFormat: "Formato invalido: {format}. Usa json o md."
      },
      config: {
        description: "Ver y actualizar configuracion de usuario",
        getDescription: "Leer un valor de configuracion",
        setDescription: "Guardar un valor de configuracion",
        resetDescription: "Restaurar configuracion por defecto",
        configPathLabel: "Ruta de config",
        keyNotFound: "No existe la clave: {key}",
        validationLanguage: "language debe ser: {supported}",
        validationTone: "tone debe ser: {supported}",
        validationExportFormat: "exportFormat debe ser: {supported}"
      }
    }
  }
};

export function formatText(templateValue, vars = {}) {
  return String(templateValue).replace(/\{(\w+)\}/g, (_, token) => String(vars[token] ?? ""));
}

export function getHelpText(language = "en") {
  return HELP_TEXTS[language] || HELP_TEXTS.en;
}

export function buildExamplesHelp(title, examples) {
  const lines = ["", `${title}:`];
  for (const example of examples) {
    lines.push(`  ${example}`);
  }
  return `${lines.join("\n")}\n`;
}

function buildAlignedSection(title, rows) {
  if (!rows.length) {
    return [];
  }

  const width = rows.reduce((max, row) => Math.max(max, row.term.length), 0);
  return [
    `${title}:`,
    ...rows.map((row) => `  ${row.term.padEnd(width)}  ${row.description}`)
  ];
}

export function formatLocalizedHelp(cmd, helper, sections) {
  const labels = {
    usage: "Usage",
    options: "Options",
    commands: "Commands",
    ...(sections || {})
  };

  const lines = [];
  lines.push(`${labels.usage}: ${helper.commandUsage(cmd)}`);

  const description = helper.commandDescription(cmd);
  if (description) {
    lines.push("");
    lines.push(description);
  }

  const options = helper.visibleOptions(cmd).map((option) => ({
    term: helper.optionTerm(option),
    description: helper.optionDescription(option)
  }));

  const commands = helper.visibleCommands(cmd).map((command) => ({
    term: helper.subcommandTerm(command),
    description: helper.subcommandDescription(command)
  }));

  const optionLines = buildAlignedSection(labels.options, options);
  if (optionLines.length) {
    lines.push("");
    lines.push(...optionLines);
  }

  const commandLines = buildAlignedSection(labels.commands, commands);
  if (commandLines.length) {
    lines.push("");
    lines.push(...commandLines);
  }

  return lines.join("\n");
}
