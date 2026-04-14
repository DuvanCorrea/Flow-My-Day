import chalk from "chalk";
import type { Command } from "commander";
import { readUserConfig } from "../config/userConfig.js";
import { addItem, markItemDone } from "../storage/dataStore.js";
import type { AddActivityInput } from "../domain/activity.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.done;
type DoneCommandLabels = typeof DEFAULT_LABELS;

function parseItemId(value: string): number | null | undefined {
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

export function registerDoneCommand(program: Command, labels: Partial<DoneCommandLabels> = {}): void {
  const text: DoneCommandLabels = { ...DEFAULT_LABELS, ...labels };

  program
    .command("done <target>")
    .description(text.description)
    .action((target: string) => {
      const config = readUserConfig();
      const id = parseItemId(target);

      if (id === undefined) {
        const activity: AddActivityInput = {
          type: "done",
          text: target,
          status: "done"
        };
        const item = addItem(config.dataFile, activity);
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
