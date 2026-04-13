# flow

Flow is a personal CLI for daily progress tracking.

## Short Description

Track what you completed, what you postponed, and what technical debt you are carrying.

## What Problem It Solves

Most task tools are too heavy for quick personal logging. Flow gives you a fast command-line flow to capture real work in seconds:

- completed tasks (`add`)
- postponed tasks (`later`)
- technical debt (`debt`)

This creates small daily wins, visible momentum, and a clean history you can export.

## Features

- Simple CLI with focused commands
- Local JSON persistence (no external services)
- User configuration stored in home directory
- Multi-language and tone support (`es`/`en`, `friendly`/`direct`)
- Stats to keep motivation visible
- Export to JSON and Markdown
- Ready for npm publishing

## Installation

### Local development

```bash
npm install
npm run help
```

### Use globally from local source

```bash
npm link
flow --help
```

### Install globally from npm (after publish)

```bash
npm install -g flow-my-day
flow --help
```

## Basic Usage

```bash
flow add "Closed bug in auth middleware"
flow later "Refactor cache invalidation"
flow debt "Remove duplicated validation in user service"
flow list
flow stats
```

## Available Commands

| Command | Description |
|---|---|
| `flow add <text>` | Register a completed task |
| `flow later <text>` | Register a task for later |
| `flow debt <text>` | Register technical debt |
| `flow list` | List stored items |
| `flow done <id>` | Mark an item as done |
| `flow stats` | Show quick productivity stats |
| `flow export [output]` | Export data to JSON or MD |
| `flow config` | Show current user configuration |
| `flow config get <key>` | Read a config value |
| `flow config set <key> <value>` | Update a config value |
| `flow config reset` | Restore default config |

## Available Flags

### `flow list`

- `-t, --type <type>`: `done|later|debt|all`
- `-s, --status <status>`: `open|done|all`
- `-l, --limit <number>`: limit amount of results
- `--json`: output as JSON

### `flow stats`

- `--json`: output as JSON

### `flow export`

- `-f, --format <format>`: `json|md`

## Configuration

Flow stores user settings at:

- `~/.flow/config.json`

Default config:

```json
{
	"language": "es",
	"tone": "friendly",
	"exportFormat": "md",
	"dataFile": "~/.flow/data.json",
	"aliases": {}
}
```

Useful config commands:

```bash
flow config
flow config get language
flow config set language en
flow config set tone direct
flow config set exportFormat json
flow config set aliases.daily "list --status open"
flow config reset
```

## JSON Data File Format

By default, Flow writes data at:

- `~/.flow/data.json`

Structure:

```json
{
	"meta": {
		"version": 1,
		"createdAt": "2026-04-13T12:00:00.000Z",
		"updatedAt": "2026-04-13T12:30:00.000Z",
		"nextId": 4
	},
	"items": [
		{
			"id": 3,
			"type": "debt",
			"text": "Remove duplicated validation in user service",
			"status": "open",
			"createdAt": "2026-04-13T12:20:00.000Z",
			"doneAt": null
		}
	]
}
```

If data or config is corrupted, Flow automatically backs it up as `*.corrupt.<timestamp>` and rebuilds a clean file.

## Real-World Examples

```bash
# Morning standup prep
flow add "Reviewed overnight errors"
flow later "Document release rollback steps"
flow debt "Split large payments service into smaller modules"

# End of day
flow list --status open
flow done 2
flow stats
flow export ./reports/daily-flow.md -f md
```

## Export

Export to JSON:

```bash
flow export ./exports/flow.json -f json
```

Export to Markdown:

```bash
flow export ./exports/flow.md -f md
```

Without output path, Flow generates:

- `./flow-export-YYYY-MM-DD.json` or
- `./flow-export-YYYY-MM-DD.md`

## npm Publishing

Before publishing, update metadata in `package.json`:

- `author`
- `repository.url`
- `homepage`
- `bugs.url`

Recommended publish flow:

```bash
npm install
npm run check
npm version patch
npm publish --access public
```

Global usage after publish:

```bash
npm install -g flow-my-day
flow --help
```

## Roadmap

- Custom command aliases execution
- Filters by date range and tags
- Weekly and monthly reports
- Optional shell completions
- Optional sync backend (still local-first by default)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Keep changes small and focused
4. Open a PR with real usage examples

## License

MIT
