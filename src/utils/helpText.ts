import { TRANSLATIONS } from "../i18n/translations.js";

interface HelpRow {
  term: string;
  description: string;
}

interface CommandRow extends HelpRow {
  name: string;
}

interface CommandGroupLabels {
  capture?: string;
  review?: string;
  manage?: string;
  other?: string;
}

interface HelpSections {
  usage?: string;
  options?: string;
  commands?: string;
  commandGroups?: CommandGroupLabels;
}

export function formatText(templateValue, vars = {}) {
  return String(templateValue).replace(/\{(\w+)\}/g, (_, token) => String(vars[token] ?? ""));
}

export function getHelpText(language = "en") {
  const entry = TRANSLATIONS[language] || TRANSLATIONS.en;
  return entry.help;
}

export function buildExamplesHelp(title, examples, tipsTitle, tips = []) {
  const lines = ["", `${title}:`];
  for (const example of examples) {
    lines.push(`  ${example}`);
  }

  if (tipsTitle && tips.length) {
    lines.push("");
    lines.push(`${tipsTitle}:`);
    for (const tip of tips) {
      lines.push(`  ${tip}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function buildAlignedRows(rows: HelpRow[], indent = "  ") {
  const width = rows.reduce((max, row) => Math.max(max, row.term.length), 0);
  return rows.map((row) => `${indent}${row.term.padEnd(width)}  ${row.description}`);
}

function buildAlignedSection(title: string, rows: HelpRow[]) {
  if (!rows.length) {
    return [];
  }

  return [
    `${title}:`,
    ...buildAlignedRows(rows)
  ];
}

function buildGroupedCommandsSection(title: string, rows: CommandRow[], labels: CommandGroupLabels = {}) {
  if (!rows.length) {
    return [];
  }

  const groups = [
    {
      label: labels.capture || "Capture",
      commands: new Set(["add", "later", "debt", "done"])
    },
    {
      label: labels.review || "Review",
      commands: new Set(["list", "stats", "export"])
    },
    {
      label: labels.manage || "Manage",
      commands: new Set(["config", "versions", "update", "help"])
    }
  ];

  const allKnown = new Set<string>();
  for (const group of groups) {
    for (const name of group.commands) {
      allKnown.add(name);
    }
  }

  const lines = [`${title}:`];

  for (const group of groups) {
    const groupRows = rows
      .filter((row) => group.commands.has(row.name))
      .map((row) => ({ term: row.term, description: row.description }));

    if (!groupRows.length) {
      continue;
    }

    lines.push(`  ${group.label}:`);
    lines.push(...buildAlignedRows(groupRows, "    "));
  }

  const otherRows = rows
    .filter((row) => !allKnown.has(row.name))
    .map((row) => ({ term: row.term, description: row.description }));

  if (otherRows.length) {
    lines.push(`  ${labels.other || "Other"}:`);
    lines.push(...buildAlignedRows(otherRows, "    "));
  }

  return lines;
}

export function formatLocalizedHelp(cmd, helper, sections: HelpSections = {}) {
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

  const options: HelpRow[] = helper.visibleOptions(cmd).map((option) => ({
    term: helper.optionTerm(option),
    description: helper.optionDescription(option)
  }));

  const commands: CommandRow[] = helper.visibleCommands(cmd).map((command) => ({
    name: helper.subcommandTerm(command).split(/\s+/)[0],
    term: helper.subcommandTerm(command),
    description: helper.subcommandDescription(command)
  }));

  const optionLines = buildAlignedSection(labels.options, options);
  if (optionLines.length) {
    lines.push("");
    lines.push(...optionLines);
  }

  const commandLines = labels.commandGroups
    ? buildGroupedCommandsSection(labels.commands, commands, labels.commandGroups)
    : buildAlignedSection(labels.commands, commands);
  if (commandLines.length) {
    lines.push("");
    lines.push(...commandLines);
  }

  return lines.join("\n");
}
