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
flow later "Preparar demo del sprint"
flow debt "Refactorizar modulo de pagos"
flow done 4
flow done "Cerrar notas de postmortem"
flow list --type later --status open --limit 5
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
| `flow list` | Lista items por seccion con color y emoji |
| `flow done <id|text>` | Marca un item por id como completado, o crea uno nuevo como completado |
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
- `--json`: salida en JSON

### flow stats

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

## Logs de error

Si un comando falla, Flow guarda un archivo de error y muestra la ruta en consola.

- Carpeta: `~/.flow/logs`
- Patron: `error-YYYYMMDD-HHmmss.log`
