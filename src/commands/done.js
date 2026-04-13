import chalk from "chalk";
import { readUserConfig } from "../config/userConfig.js";
import { markItemDone } from "../storage/dataStore.js";
import { t } from "../utils/messages.js";

export function registerDoneCommand(program) {
  program
    .command("done <id>")
    .description("Marcar un item pendiente como hecho")
    .action((id) => {
      const config = readUserConfig();
      const item = markItemDone(config.dataFile, id);

      if (!item) {
        console.log(chalk.red(t(config, "notFound", { id })));
        process.exitCode = 1;
        return;
      }

      console.log(chalk.green(t(config, "done", { id })));
    });
}
