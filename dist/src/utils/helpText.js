import { TRANSLATIONS } from "../i18n/translations.js";
export function formatText(templateValue, vars = {}) {
    return String(templateValue).replace(/\{(\w+)\}/g, (_, token) => String(vars[token] ?? ""));
}
export function getHelpText(language = "en") {
    const entry = TRANSLATIONS[language] || TRANSLATIONS.en;
    return entry.help;
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
