import chalk from "chalk";
import type { Command } from "commander";
import { createActivityRepository } from "../application/factories/createActivityRepository.js";
import { readUserConfig } from "../config/userConfig.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.undo;
type UndoCommandLabels = typeof DEFAULT_LABELS;

export function registerUndoCommand(program: Command, labels: Partial<UndoCommandLabels> = {}): void {
  const text: UndoCommandLabels = { ...DEFAULT_LABELS, ...labels };

  program
    .command("undo")
    .description(text.description)
    .action(() => {
      const config = readUserConfig();
      const repository = createActivityRepository(config.dataFile);
      const restored = repository.undoLastChange();

      if (!restored) {
        console.log(chalk.gray(t(config, "undoNothing")));
        return;
      }

      console.log(chalk.green(t(config, "undoOk")));
    });
}
