export const TRANSLATIONS = {
  en: {
    messages: {
      friendly: {
        added: "Done. Logged as completed: {text}",
        later: "Saved for later: {text}",
        debt: "Technical debt logged: {text}",
        done: "Marked as done: #{id}",
        invalidId: "Invalid item id: {id}. Use a positive number.",
        notFound: "Could not find item #{id}",
        emptyList: "No items to show.",
        exportOk: "Export complete at: {path}",
        configUpdated: "Configuration updated.",
        configReset: "Configuration reset to defaults.",
        unexpectedError: "Something went wrong: {error}",
        errorLogPath: "Error details were saved at: {path}"
      },
      direct: {
        added: "Completed: {text}",
        later: "Queued for later: {text}",
        debt: "Debt logged: {text}",
        done: "Completed: #{id}",
        invalidId: "Invalid item id: {id}. Use a positive number.",
        notFound: "Item not found: #{id}",
        emptyList: "No items.",
        exportOk: "Exported to: {path}",
        configUpdated: "Configuration saved.",
        configReset: "Configuration reset.",
        unexpectedError: "Error: {error}",
        errorLogPath: "Log saved at: {path}"
      }
    },
    help: {
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
          description: "Mark an open item as done, or create one directly"
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
          invalidFormat: "Invalid format: {format}. Use json or md.",
          markdownTitle: "Flow Daily Log",
          markdownGenerated: "Generated",
          markdownEmpty: "No items.",
          markdownSectionDone: "Done",
          markdownSectionLater: "Later",
          markdownSectionDebt: "Technical Debt",
          markdownStatus: {
            done: "done",
            open: "open"
          }
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
        },
        versions: {
          description: "List available published versions",
          listTitle: "Available versions for {package}",
          latestTag: "latest",
          currentTag: "current",
          noVersions: "No published versions found.",
          fetchFailed: "Could not fetch versions: {error}"
        },
        update: {
          description: "Update flow globally (default: latest)",
          optionDryRun: "Show npm command without installing",
          noVersions: "No published versions found.",
          versionNotAvailable: "Version {version} is not available. Run flow versions.",
          alreadyUpToDate: "You are already on version {version}.",
          dryRunCommand: "Dry run: npm install -g {package}@{version}",
          installing: "Installing {package}@{version} globally...",
          updateSuccess: "Update complete. Installed version: {version}",
          updateFailed: "Update failed: {error}"
        }
      }
    }
  },
  es: {
    messages: {
      friendly: {
        added: "Listo. Registrado como completado: {text}",
        later: "Guardado para despues: {text}",
        debt: "Deuda tecnica registrada: {text}",
        done: "Marcado como completado: #{id}",
        invalidId: "ID de item invalido: {id}. Usa un numero positivo.",
        notFound: "No se encontro el item #{id}",
        emptyList: "No hay items para mostrar.",
        exportOk: "Exportacion completada en: {path}",
        configUpdated: "Configuracion actualizada.",
        configReset: "Configuracion restaurada por defecto.",
        unexpectedError: "Algo salio mal: {error}",
        errorLogPath: "Los detalles del error se guardaron en: {path}"
      },
      direct: {
        added: "Completado: {text}",
        later: "Pendiente guardado: {text}",
        debt: "Deuda registrada: {text}",
        done: "Completado: #{id}",
        invalidId: "ID de item invalido: {id}. Usa un numero positivo.",
        notFound: "Item no encontrado: #{id}",
        emptyList: "Sin items.",
        exportOk: "Exportado en: {path}",
        configUpdated: "Configuracion guardada.",
        configReset: "Configuracion reiniciada.",
        unexpectedError: "Error: {error}",
        errorLogPath: "Log guardado en: {path}"
      }
    },
    help: {
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
          description: "Marcar un item abierto como hecho, o crear uno directo"
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
          invalidFormat: "Formato invalido: {format}. Usa json o md.",
          markdownTitle: "Registro Diario Flow",
          markdownGenerated: "Generado",
          markdownEmpty: "Sin items.",
          markdownSectionDone: "Hecho",
          markdownSectionLater: "Pendiente",
          markdownSectionDebt: "Deuda Tecnica",
          markdownStatus: {
            done: "hecho",
            open: "abierto"
          }
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
        },
        versions: {
          description: "Listar versiones publicadas disponibles",
          listTitle: "Versiones disponibles de {package}",
          latestTag: "latest",
          currentTag: "actual",
          noVersions: "No se encontraron versiones publicadas.",
          fetchFailed: "No se pudieron consultar las versiones: {error}"
        },
        update: {
          description: "Actualizar flow globalmente (por defecto: latest)",
          optionDryRun: "Mostrar comando npm sin instalar",
          noVersions: "No se encontraron versiones publicadas.",
          versionNotAvailable: "La version {version} no esta disponible. Ejecuta flow versions.",
          alreadyUpToDate: "Ya tienes la version {version}.",
          dryRunCommand: "Simulacion: npm install -g {package}@{version}",
          installing: "Instalando {package}@{version} globalmente...",
          updateSuccess: "Actualizacion completa. Version instalada: {version}",
          updateFailed: "Fallo la actualizacion: {error}"
        }
      }
    }
  }
};
