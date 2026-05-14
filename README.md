# flow

CLI personal para registrar avance diario: tareas hechas, tareas para despues y deuda tecnica.

Paquete publicado en npm:

- https://www.npmjs.com/package/flow-my-day

## Instalacion

```bash
npm install -g flow-my-day
flow --help
```

## Uso rapido

```bash
flow add "Cerrado bug de login"
flow add "Migrar checkout" --project "Payments"
flow later "Preparar demo del sprint"
flow debt "Refactorizar modulo de pagos"
flow done 4
flow done "Cerrar notas de postmortem"
flow edit 2 --new "Preparar demo del sprint + checklist"
flow project list
flow project add "Core"
flow project rename 1 "Payments API"
flow project remove 1
flow remove 3
flow undo
flow list --type later --status open --limit 5
flow list --project "Payments"
flow list --today
flow list --week
flow list --month
flow list --date "2026-04-13"
flow list --from "2026-04-01" --to "2026-04-13"
flow stats --project "Payments" --week --json
flow stats --json
```

## Resumen de comandos

| Comando | Para que sirve |
|---|---|
| `flow -V` | Muestra la version instalada |
| `flow --version` | Muestra la version instalada |
| `flow -h` | Muestra ayuda |
| `flow --help` | Muestra ayuda |
| `flow help [command]` | Ayuda de un comando especifico |
| `flow add <text>` | Registra una tarea completada |
| `flow later <text>` | Registra una tarea para despues |
| `flow debt <text>` | Registra deuda tecnica |
| `flow edit <id> --new <text>` | Edita el texto de una actividad |
| `flow list` | Lista items por seccion con color y emoji |
| `flow done <id|text>` | Marca un item por id como completado, o crea uno nuevo como completado |
| `flow project` | Gestiona proyectos |
| `flow project list` | Lista proyectos |
| `flow project add <name>` | Crea un proyecto |
| `flow project rename <id> <name>` | Renombra un proyecto |
| `flow project remove <id>` | Elimina un proyecto y deja actividades huerfanas |
| `flow remove <id>` | Elimina una actividad por id |
| `flow undo` | Deshace el ultimo cambio de datos |
| `flow stats` | Muestra estadisticas rapidas |
| `flow export [output]` | Exporta a JSON o Markdown |
| `flow config` | Muestra configuracion actual |
| `flow config get <key>` | Lee una clave de configuracion |
| `flow config set <key> <value>` | Guarda una clave de configuracion |
| `flow config reset` | Restaura configuracion por defecto |
| `flow versions` | Lista versiones publicadas |
| `flow update [version]` | Actualiza la CLI (por defecto latest) |

## Flags utiles

### flow list

- `-t, --type <type>`: `done|later|debt|all`
- `-s, --status <status>`: `open|done|all`
- `-l, --limit <number>`: limitar resultados
- `-p, --project <project>`: filtrar por proyecto (id o nombre)
- `--today`: solo actividades creadas hoy
- `--week`: solo actividades de los ultimos 7 dias
- `--month`: solo actividades del mes actual
- `-d, --date <AAAA-MM-DD>`: solo actividades de una fecha puntual
- `--from <AAAA-MM-DD>`: solo actividades desde fecha (incluida)
- `--to <AAAA-MM-DD>`: solo actividades hasta fecha (incluida)
- `--json`: salida en JSON

### flow add / later / debt / done

- `-p, --project <project>`: asigna proyecto por id o nombre (si no existe por nombre, se crea)

### flow edit

- `-n, --new <text>`: nuevo texto para la actividad

### flow project

- `--json`: salida en JSON (para `flow project list`)

### flow stats

- `-p, --project <project>`: filtrar por proyecto (id o nombre)
- `--today`: solo actividades creadas hoy
- `--week`: solo actividades de los ultimos 7 dias
- `--month`: solo actividades del mes actual
- `-d, --date <AAAA-MM-DD>`: solo actividades de una fecha puntual
- `--from <AAAA-MM-DD>`: solo actividades desde fecha (incluida)
- `--to <AAAA-MM-DD>`: solo actividades hasta fecha (incluida)
- `--json`: salida en JSON

### flow export

- `-f, --format <format>`: `json|md`

### flow update

- `--dry-run`: muestra el comando npm sin instalar

## Idioma y tono

```bash
flow config set language es
flow config set language en
flow config set tone friendly
flow config set tone direct
```

## Actualizacion desde la CLI

```bash
flow versions
flow update
flow update 1.1.0
flow update --dry-run
```

<!-- Local PowerShell helper scripts removed from documentation. -->

## Logs de error

Si un comando falla, Flow guarda un archivo de error y muestra la ruta en consola.

- Carpeta: `~/.flow/logs`
- Patron: `error-YYYYMMDD-HHmmss.log`
