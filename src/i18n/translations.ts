export const TRANSLATIONS = {
  en: {
    messages: {
      friendly: {
        added: "Done. Logged as completed: {text}",
        later: "Saved for later: {text}",
        debt: "Technical debt logged: {text}",
        done: "Marked as done: #{id}",
        removed: "Removed item: #{id} {text}",
        invalidId: "Invalid item id: {id}. Use a positive number.",
        notFound: "Could not find item #{id}",
        emptyList: "No items to show.",
        exportOk: "Export complete at: {path}",
        configUpdated: "Configuration updated.",
        configReset: "Configuration reset to defaults.",
        edited: "Item updated: #{id} -> {text}",
        editMissingNew: "Provide the new text with --new \"...\".",
        noProjects: "No projects yet.",
        projectCreated: "Project created: #{id} {name}",
        projectDeleted: "Project removed: #{id} {name}. Orphaned activities: {count}",
        projectRenamed: "Project renamed: #{id} {name}",
        projectNotFound: "Project not found: {project}",
        projectNameTaken: "A project with that name already exists: {name}",
        invalidDate: "Invalid date: {date}. Use YYYY-MM-DD.",
        invalidDateRange: "Invalid date range: from {from} must be before or equal to {to}.",
        listDateFilterConflict: "Use one date mode only: --today, --week, --month, --date, or --from/--to.",
        undoOk: "Last change reverted.",
        undoNothing: "Nothing to undo.",
        projectNameRequired: "Project name is required.",
        projectSelectionTitle: "Select a project for this activity",
        projectNoneOption: "None",
        projectSelectionPrompt: "Enter project id (0 for none):",
        projectSelectionInvalid: "Invalid project id. Choose one from the list.",
        unexpectedError: "Something went wrong: {error}",
        errorLogPath: "Error details were saved at: {path}"
      },
      direct: {
        added: "Completed: {text}",
        later: "Queued for later: {text}",
        debt: "Debt logged: {text}",
        done: "Completed: #{id}",
        removed: "Removed: #{id} {text}",
        invalidId: "Invalid item id: {id}. Use a positive number.",
        notFound: "Item not found: #{id}",
        emptyList: "No items.",
        exportOk: "Exported to: {path}",
        configUpdated: "Configuration saved.",
        configReset: "Configuration reset.",
        edited: "Updated: #{id} -> {text}",
        editMissingNew: "Provide --new \"...\".",
        noProjects: "No projects.",
        projectCreated: "Created project #{id}: {name}",
        projectDeleted: "Removed project #{id}: {name}. Orphaned activities: {count}",
        projectRenamed: "Renamed project #{id}: {name}",
        projectNotFound: "Project not found: {project}",
        projectNameTaken: "Project name already exists: {name}",
        invalidDate: "Invalid date: {date}. Use YYYY-MM-DD.",
        invalidDateRange: "Invalid date range: {from}..{to}",
        listDateFilterConflict: "Use one date mode only.",
        undoOk: "Reverted last change.",
        undoNothing: "Nothing to undo.",
        projectNameRequired: "Project name is required.",
        projectSelectionTitle: "Select project",
        projectNoneOption: "None",
        projectSelectionPrompt: "Project id (0 none):",
        projectSelectionInvalid: "Invalid project id.",
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
          commands: "Commands",
          commandGroups: {
            capture: "Capture",
            review: "Review",
            manage: "Manage",
            other: "Other"
          }
        },
        examplesTitle: "Examples",
        examples: [
          'flow add "Fix login bug"',
          'flow add "Migrate checkout" --project "Payments"',
          'flow later "Prepare sprint demo"',
          'flow debt "Split monolithic payment handler"',
          "flow done 4",
          'flow done "Close postmortem notes"',
          'flow edit 2 --new "Prepare sprint demo + checklist"',
          'flow project add "Core"',
          'flow project rename 1 "Payments API"',
          "flow project list",
          "flow remove 3",
          "flow undo",
          'flow list --project "Payments"',
          "flow list --today",
          "flow list --week",
          "flow list --month",
          "flow list --date 2026-04-13",
          "flow list --from 2026-04-01 --to 2026-04-13",
          "flow stats --project Payments --week",
          "flow list --type later --status open --limit 5",
          "flow stats --json",
          "flow export ./reports/today.md -f md",
          "flow config set language en"
        ],
        tipsTitle: "Quick tips",
        tips: [
          "Use quotes when text has spaces.",
          "done <id> completes an existing item.",
          'done "<text>" creates a completed item directly.',
          "Use flow help <command> for command-specific help."
        ]
      },
      commands: {
        add: {
          description: "Log a completed task",
          optionProject: "Assign project by id or name (creates by name if missing)"
        },
        later: {
          description: "Log a task for later",
          optionProject: "Assign project by id or name (creates by name if missing)"
        },
        debt: {
          description: "Log technical debt",
          optionProject: "Assign project by id or name (creates by name if missing)"
        },
        list: {
          description: "List saved items",
          optionType: "Filter by type: done|later|debt|all",
          optionStatus: "Filter by status: open|done|all",
          optionLimit: "Limit number of results",
          optionProject: "Filter by project id or name",
          optionToday: "Only items created today",
          optionWeek: "Only items from the last 7 days",
          optionMonth: "Only items from current month",
          optionDate: "Only items from a specific date",
          optionFrom: "Only items from date (inclusive)",
          optionTo: "Only items up to date (inclusive)",
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
          projectLabel: "project",
          projectNone: "none",
          unknownTime: "unknown-time"
        },
        done: {
          description: "Mark an open item as done, or create one directly",
          optionProject: "Assign project by id or name when creating done by text"
        },
        edit: {
          description: "Edit activity text by id",
          optionNew: "New text to replace the current one"
        },
        project: {
          description: "Manage projects",
          title: "Projects",
          optionJson: "Output as JSON",
          listDescription: "List projects",
          addDescription: "Create a project",
          removeDescription: "Remove a project and orphan related activities",
          renameDescription: "Rename a project"
        },
        remove: {
          description: "Remove an activity by id"
        },
        undo: {
          description: "Undo the last data change"
        },
        stats: {
          description: "Show quick productivity metrics",
          optionProject: "Filter by project id or name",
          optionToday: "Only items created today",
          optionWeek: "Only items from the last 7 days",
          optionMonth: "Only items from current month",
          optionDate: "Only items from a specific date",
          optionFrom: "Only items from date (inclusive)",
          optionTo: "Only items up to date (inclusive)",
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
          markdownProjectLabel: "project",
          markdownProjectNone: "none",
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
        removed: "Item eliminado: #{id} {text}",
        invalidId: "ID de item invalido: {id}. Usa un numero positivo.",
        notFound: "No se encontro el item #{id}",
        emptyList: "No hay items para mostrar.",
        exportOk: "Exportacion completada en: {path}",
        configUpdated: "Configuracion actualizada.",
        configReset: "Configuracion restaurada por defecto.",
        edited: "Item actualizado: #{id} -> {text}",
        editMissingNew: "Indica el texto nuevo con --new \"...\".",
        noProjects: "Aun no hay proyectos.",
        projectCreated: "Proyecto creado: #{id} {name}",
        projectDeleted: "Proyecto eliminado: #{id} {name}. Actividades huerfanas: {count}",
        projectRenamed: "Proyecto renombrado: #{id} {name}",
        projectNotFound: "Proyecto no encontrado: {project}",
        projectNameTaken: "Ya existe un proyecto con ese nombre: {name}",
        invalidDate: "Fecha invalida: {date}. Usa AAAA-MM-DD.",
        invalidDateRange: "Rango de fechas invalido: desde {from} debe ser menor o igual a {to}.",
        listDateFilterConflict: "Usa solo un modo de fecha: --today, --week, --month, --date o --from/--to.",
        undoOk: "Se revirtio el ultimo cambio.",
        undoNothing: "No hay cambios para deshacer.",
        projectNameRequired: "El nombre del proyecto es obligatorio.",
        projectSelectionTitle: "Selecciona un proyecto para esta actividad",
        projectNoneOption: "Ninguno",
        projectSelectionPrompt: "Ingresa el id del proyecto (0 para ninguno):",
        projectSelectionInvalid: "Id de proyecto invalido. Elige uno de la lista.",
        unexpectedError: "Algo salio mal: {error}",
        errorLogPath: "Los detalles del error se guardaron en: {path}"
      },
      direct: {
        added: "Completado: {text}",
        later: "Pendiente guardado: {text}",
        debt: "Deuda registrada: {text}",
        done: "Completado: #{id}",
        removed: "Eliminado: #{id} {text}",
        invalidId: "ID de item invalido: {id}. Usa un numero positivo.",
        notFound: "Item no encontrado: #{id}",
        emptyList: "Sin items.",
        exportOk: "Exportado en: {path}",
        configUpdated: "Configuracion guardada.",
        configReset: "Configuracion reiniciada.",
        edited: "Actualizado: #{id} -> {text}",
        editMissingNew: "Indica --new \"...\".",
        noProjects: "Sin proyectos.",
        projectCreated: "Proyecto creado #{id}: {name}",
        projectDeleted: "Proyecto eliminado #{id}: {name}. Actividades huerfanas: {count}",
        projectRenamed: "Proyecto renombrado #{id}: {name}",
        projectNotFound: "Proyecto no encontrado: {project}",
        projectNameTaken: "Nombre de proyecto ya existe: {name}",
        invalidDate: "Fecha invalida: {date}. Usa AAAA-MM-DD.",
        invalidDateRange: "Rango de fechas invalido: {from}..{to}",
        listDateFilterConflict: "Usa solo un modo de fecha.",
        undoOk: "Ultimo cambio revertido.",
        undoNothing: "Nada para deshacer.",
        projectNameRequired: "Nombre de proyecto obligatorio.",
        projectSelectionTitle: "Seleccionar proyecto",
        projectNoneOption: "Ninguno",
        projectSelectionPrompt: "Id de proyecto (0 ninguno):",
        projectSelectionInvalid: "Id de proyecto invalido.",
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
          commands: "Comandos",
          commandGroups: {
            capture: "Captura",
            review: "Revision",
            manage: "Gestion",
            other: "Otros"
          }
        },
        examplesTitle: "Ejemplos",
        examples: [
          'flow add "Corregir bug de login"',
          'flow add "Migrar checkout" --project "Payments"',
          'flow later "Preparar demo del sprint"',
          'flow debt "Separar handler monolitico de pagos"',
          "flow done 4",
          'flow done "Cerrar notas de postmortem"',
          'flow edit 2 --new "Preparar demo del sprint + checklist"',
          'flow project add "Core"',
          'flow project rename 1 "Payments API"',
          "flow project list",
          "flow remove 3",
          "flow undo",
          'flow list --project "Payments"',
          "flow list --today",
          "flow list --week",
          "flow list --month",
          "flow list --date 2026-04-13",
          "flow list --from 2026-04-01 --to 2026-04-13",
          "flow stats --project Payments --week",
          "flow list --type later --status open --limit 5",
          "flow stats --json",
          "flow export ./reports/hoy.md -f md",
          "flow config set language es"
        ],
        tipsTitle: "Tips rapidos",
        tips: [
          "Usa comillas cuando el texto tenga espacios.",
          "done <id> completa un item existente.",
          'done "<texto>" crea un item completado directamente.',
          "Usa flow help <command> para ver ayuda especifica."
        ]
      },
      commands: {
        add: {
          description: "Registrar una tarea completada",
          optionProject: "Asignar proyecto por id o nombre (si no existe por nombre, se crea)"
        },
        later: {
          description: "Registrar una tarea para despues",
          optionProject: "Asignar proyecto por id o nombre (si no existe por nombre, se crea)"
        },
        debt: {
          description: "Registrar deuda tecnica",
          optionProject: "Asignar proyecto por id o nombre (si no existe por nombre, se crea)"
        },
        list: {
          description: "Listar items guardados",
          optionType: "Filtrar por tipo: done|later|debt|all",
          optionStatus: "Filtrar por estado: open|done|all",
          optionLimit: "Limitar cantidad de resultados",
          optionProject: "Filtrar por proyecto (id o nombre)",
          optionToday: "Solo items creados hoy",
          optionWeek: "Solo items de los ultimos 7 dias",
          optionMonth: "Solo items del mes actual",
          optionDate: "Solo items de una fecha especifica",
          optionFrom: "Solo items desde fecha (incluida)",
          optionTo: "Solo items hasta fecha (incluida)",
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
          projectLabel: "proyecto",
          projectNone: "ninguno",
          unknownTime: "hora-desconocida"
        },
        done: {
          description: "Marcar un item abierto como hecho, o crear uno directo",
          optionProject: "Asignar proyecto por id o nombre cuando done crea por texto"
        },
        edit: {
          description: "Editar texto de una actividad por id",
          optionNew: "Texto nuevo para reemplazar el actual"
        },
        project: {
          description: "Gestionar proyectos",
          title: "Proyectos",
          optionJson: "Salida en JSON",
          listDescription: "Listar proyectos",
          addDescription: "Crear un proyecto",
          removeDescription: "Eliminar un proyecto y dejar huerfanas las actividades asociadas",
          renameDescription: "Renombrar un proyecto"
        },
        remove: {
          description: "Eliminar una actividad por id"
        },
        undo: {
          description: "Deshacer el ultimo cambio de datos"
        },
        stats: {
          description: "Mostrar metricas rapidas de productividad",
          optionProject: "Filtrar por proyecto (id o nombre)",
          optionToday: "Solo items creados hoy",
          optionWeek: "Solo items de los ultimos 7 dias",
          optionMonth: "Solo items del mes actual",
          optionDate: "Solo items de una fecha especifica",
          optionFrom: "Solo items desde fecha (incluida)",
          optionTo: "Solo items hasta fecha (incluida)",
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
          markdownProjectLabel: "proyecto",
          markdownProjectNone: "ninguno",
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
