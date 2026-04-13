import chalk from "chalk";
import { readUserConfig } from "../config/userConfig.js";
import { addItem } from "../storage/dataStore.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.debt;

export function registerDebtCommand(program, labels = {}) {
  const text = { ...DEFAULT_LABELS, ...labels };

  program
    .command("debt <text>")
    .description(text.description)
    .action((text) => {
      const config = readUserConfig();
      addItem(config.dataFile, { type: "debt", text, status: "open" });
      console.log(chalk.magenta(t(config, "debt", { text })));
    });
}
