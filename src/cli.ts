import { Command } from "commander";
import { createRequire } from "node:module";
import { readUserConfig } from "./config/userConfig.js";
import {
  buildExamplesHelp,
  formatLocalizedHelp,
  getHelpText
} from "./utils/helpText.js";
import { registerAddCommand } from "./commands/add.js";
import { registerLaterCommand } from "./commands/later.js";
import { registerDebtCommand } from "./commands/debt.js";
import { registerListCommand } from "./commands/list.js";
import { registerDoneCommand } from "./commands/done.js";
import { registerStatsCommand } from "./commands/stats.js";
import { registerExportCommand } from "./commands/export.js";
import { registerConfigCommand } from "./commands/config.js";
import { registerEditCommand } from "./commands/edit.js";
import { registerRemoveCommand } from "./commands/remove.js";
import { registerProjectCommand } from "./commands/project.js";
import { registerUndoCommand } from "./commands/undo.js";
import { registerVersionsCommand } from "./commands/versions.js";
import { registerUpdateCommand } from "./commands/update.js";

const require = createRequire(import.meta.url);
const { version } = require("../../package.json");

export function buildProgram() {
  const config = readUserConfig();
  const helpText = getHelpText(config.language);

  const program = new Command();

  program
    .name("flow")
    .description(helpText.cli.description)
    .version(version, "-V, --version", helpText.cli.versionDescription)
    .helpOption("-h, --help", helpText.cli.helpOptionDescription)
    .addHelpCommand("help [command]", helpText.cli.helpCommandDescription)
    .showHelpAfterError(`\n${helpText.cli.helpAfterError}`);

  program.configureHelp({
    formatHelp: (cmd, helper) => formatLocalizedHelp(cmd, helper, helpText.cli.helpSections)
  });

  program.addHelpText(
    "after",
    buildExamplesHelp(
      helpText.cli.examplesTitle,
      helpText.cli.examples,
      helpText.cli.tipsTitle,
      helpText.cli.tips
    )
  );

  registerAddCommand(program, helpText.commands.add);
  registerLaterCommand(program, helpText.commands.later);
  registerDebtCommand(program, helpText.commands.debt);
  registerListCommand(program, helpText.commands.list);
  registerDoneCommand(program, helpText.commands.done);
  registerEditCommand(program, helpText.commands.edit);
  registerRemoveCommand(program, helpText.commands.remove);
  registerProjectCommand(program, helpText.commands.project);
  registerUndoCommand(program, helpText.commands.undo);
  registerStatsCommand(program, helpText.commands.stats);
  registerExportCommand(program, helpText.commands.export);
  registerConfigCommand(program, helpText.commands.config);
  registerVersionsCommand(program, helpText.commands.versions);
  registerUpdateCommand(program, helpText.commands.update);

  return program;
}

function normalizeLegacyOptionSyntax(argv: string[]): string[] {
  return argv.map((arg) => {
    if (arg === "-new") return "--new";
    if (arg === "-project") return "--project";
    if (arg === "-date") return "--date";
    if (arg === "-from") return "--from";
    if (arg === "-to") return "--to";
    return arg;
  });
}

export async function run(argv = process.argv) {
  const program = buildProgram();
  await program.parseAsync(normalizeLegacyOptionSyntax(argv));
}
