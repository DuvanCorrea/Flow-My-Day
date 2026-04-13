import chalk from "chalk";
import { readUserConfig } from "../config/userConfig.js";
import { addItem } from "../storage/dataStore.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.add;

export function registerAddCommand(program, labels = {}) {
  const text = { ...DEFAULT_LABELS, ...labels };

  program
    .command("add <text>")
    .description(text.description)
    .action((text) => {
      const config = readUserConfig();
      addItem(config.dataFile, { type: "done", text, status: "done" });
      console.log(chalk.green(t(config, "added", { text })));
    });
}
