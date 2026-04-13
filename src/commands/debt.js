import chalk from "chalk";
import { readUserConfig } from "../config/userConfig.js";
import { addItem } from "../storage/dataStore.js";
import { t } from "../utils/messages.js";

export function registerDebtCommand(program) {
  program
    .command("debt <text>")
    .description("Log technical debt")
    .action((text) => {
      const config = readUserConfig();
      addItem(config.dataFile, { type: "debt", text, status: "open" });
      console.log(chalk.magenta(t(config, "debt", { text })));
    });
}
