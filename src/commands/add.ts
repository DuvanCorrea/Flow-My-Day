import chalk from "chalk";
import type { Command } from "commander";
import { readUserConfig } from "../config/userConfig.js";
import { addItem } from "../storage/dataStore.js";
import type { AddActivityInput } from "../domain/activity.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.add;
type AddCommandLabels = typeof DEFAULT_LABELS;

export function registerAddCommand(program: Command, labels: Partial<AddCommandLabels> = {}): void {
  const text: AddCommandLabels = { ...DEFAULT_LABELS, ...labels };

  program
    .command("add <text>")
    .description(text.description)
    .action((text: string) => {
      const config = readUserConfig();
      const activity: AddActivityInput = { type: "done", text, status: "done" };
      addItem(config.dataFile, activity);
      console.log(chalk.green(t(config, "added", { text })));
    });
}
