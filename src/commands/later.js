import chalk from "chalk";
import { readUserConfig } from "../config/userConfig.js";
import { addItem } from "../storage/dataStore.js";
import { t } from "../utils/messages.js";

export function registerLaterCommand(program) {
  program
    .command("later <text>")
    .description("Log a task for later")
    .action((text) => {
      const config = readUserConfig();
      addItem(config.dataFile, { type: "later", text, status: "open" });
      console.log(chalk.yellow(t(config, "later", { text })));
    });
}
