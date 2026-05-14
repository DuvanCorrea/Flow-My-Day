# Agent Instructions

## Text Internationalization Standard

All user-facing text must be centralized in a single global translation file:

- `src/i18n/translations.js`

This includes, but is not limited to:

- command descriptions
- option/help labels
- console output messages
- validation and error messages
- list section/status labels
- export markdown labels

## Mandatory Rules

1. Do not hardcode user-facing strings in command files under `src/commands`.
2. Do not duplicate translation catalogs in multiple files.
3. Use `getHelpText(language)` for command/help labels.
4. Use `t(config, key, vars)` for runtime messages.
5. If a new text is added, add it for both `en` and `es` in `src/i18n/translations.js`.
6. Keep placeholders stable across languages (example: `{version}`, `{package}`, `{error}`).
7. Always update README.md if is necesary
8. Always review changes (git status/diff) and update README.md when needed.

## Implementation Pattern

- Help/command labels: `src/utils/helpText.js`
- Runtime messages: `src/utils/messages.js`
- Single source of truth: `src/i18n/translations.js`

## Quality Gate

Before finishing changes:

1. Run `npm test`.
2. Verify `flow help` in `en` and `es`.
3. Confirm no hardcoded user-facing strings were introduced in command files.
