import chalk from "chalk";
import type { Command } from "commander";
import { readUserConfig } from "../config/userConfig.js";
import { addItem } from "../storage/dataStore.js";
import type { AddActivityInput } from "../domain/activity.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.later;
type LaterCommandLabels = typeof DEFAULT_LABELS;

export function registerLaterCommand(program: Command, labels: Partial<LaterCommandLabels> = {}): void {
  const text: LaterCommandLabels = { ...DEFAULT_LABELS, ...labels };

  program
    .command("later <text>")
    .description(text.description)
    .action((text: string) => {
      const config = readUserConfig();
      const activity: AddActivityInput = { type: "later", text, status: "open" };
      addItem(config.dataFile, activity);
      console.log(chalk.yellow(t(config, "later", { text })));
    });
}
