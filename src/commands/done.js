import chalk from "chalk";
import { readUserConfig } from "../config/userConfig.js";
import { addItem, markItemDone } from "../storage/dataStore.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.done;

function parseItemId(value) {
  const normalized = String(value).trim();
  if (!/^[+-]?\d+$/.test(normalized)) {
    return undefined;
  }

  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function registerDoneCommand(program, labels = {}) {
  const text = { ...DEFAULT_LABELS, ...labels };

  program
    .command("done <target>")
    .description(text.description)
    .action((target) => {
      const config = readUserConfig();
      const id = parseItemId(target);

      if (id === undefined) {
        const item = addItem(config.dataFile, {
          type: "done",
          text: target,
          status: "done"
        });
        console.log(chalk.green(t(config, "done", { id: item.id })));
        return;
      }

      if (id === null) {
        console.log(chalk.red(t(config, "invalidId", { id: target })));
        process.exitCode = 1;
        return;
      }

      const item = markItemDone(config.dataFile, id);

      if (!item) {
        console.log(chalk.red(t(config, "notFound", { id })));
        process.exitCode = 1;
        return;
      }

      console.log(chalk.green(t(config, "done", { id: item.id })));
    });
}
