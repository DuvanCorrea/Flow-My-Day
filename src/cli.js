import { Command } from "commander";
import { createRequire } from "node:module";
import { ensureUserConfig } from "./config/userConfig.js";
import { registerAddCommand } from "./commands/add.js";
import { registerLaterCommand } from "./commands/later.js";
import { registerDebtCommand } from "./commands/debt.js";
import { registerListCommand } from "./commands/list.js";
import { registerDoneCommand } from "./commands/done.js";
import { registerStatsCommand } from "./commands/stats.js";
import { registerExportCommand } from "./commands/export.js";
import { registerConfigCommand } from "./commands/config.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

export function buildProgram() {
  ensureUserConfig();

  const program = new Command();

  program
    .name("flow")
    .description("Personal CLI to track completed work, later tasks, and technical debt")
    .version(version)
    .showHelpAfterError("\nUse flow --help to view commands and examples.");

  program.addHelpText(
    "after",
    `
Examples:
  flow add "Fix login bug"
  flow later "Write onboarding docs"
  flow debt "Split monolithic payment handler"
  flow list --status open
  flow done 4
  flow stats
  flow export ./reports/today.md -f md
  flow config set language en
`
  );

  registerAddCommand(program);
  registerLaterCommand(program);
  registerDebtCommand(program);
  registerListCommand(program);
  registerDoneCommand(program);
  registerStatsCommand(program);
  registerExportCommand(program);
  registerConfigCommand(program);

  return program;
}

export function run(argv = process.argv) {
  const program = buildProgram();
  program.parse(argv);
}
