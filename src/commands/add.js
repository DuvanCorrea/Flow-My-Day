import chalk from "chalk";
import { readUserConfig } from "../config/userConfig.js";
import { addItem } from "../storage/dataStore.js";
import { t } from "../utils/messages.js";

export function registerAddCommand(program) {
  program
    .command("add <text>")
    .description("Log a completed task")
    .action((text) => {
      const config = readUserConfig();
      addItem(config.dataFile, { type: "done", text, status: "done" });
      console.log(chalk.green(t(config, "added", { text })));
    });
}
