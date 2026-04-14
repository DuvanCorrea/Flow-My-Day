import chalk from "chalk";
import type { Command } from "commander";
import { readUserConfig } from "../config/userConfig.js";
import { addItem } from "../storage/dataStore.js";
import type { AddActivityInput } from "../domain/activity.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.debt;
type DebtCommandLabels = typeof DEFAULT_LABELS;

export function registerDebtCommand(program: Command, labels: Partial<DebtCommandLabels> = {}): void {
  const text: DebtCommandLabels = { ...DEFAULT_LABELS, ...labels };

  program
    .command("debt <text>")
    .description(text.description)
    .action((text: string) => {
      const config = readUserConfig();
      const activity: AddActivityInput = { type: "debt", text, status: "open" };
      addItem(config.dataFile, activity);
      console.log(chalk.magenta(t(config, "debt", { text })));
    });
}
