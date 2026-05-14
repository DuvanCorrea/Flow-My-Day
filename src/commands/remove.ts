import chalk from "chalk";
import type { Command } from "commander";
import { createActivityRepository } from "../application/factories/createActivityRepository.js";
import { readUserConfig } from "../config/userConfig.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.remove;
type RemoveCommandLabels = typeof DEFAULT_LABELS;

export function registerRemoveCommand(program: Command, labels: Partial<RemoveCommandLabels> = {}): void {
  const text: RemoveCommandLabels = { ...DEFAULT_LABELS, ...labels };

  program
    .command("remove <id>")
    .description(text.description)
    .action((id: string) => {
      const parsedId = Number(id);
      if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
        const config = readUserConfig();
        console.log(chalk.red(t(config, "invalidId", { id })));
        process.exitCode = 1;
        return;
      }

      const config = readUserConfig();
      const repository = createActivityRepository(config.dataFile);
      const deleted = repository.deleteById(parsedId);

      if (!deleted) {
        console.log(chalk.red(t(config, "notFound", { id: parsedId })));
        process.exitCode = 1;
        return;
      }

      console.log(chalk.yellow(t(config, "removed", { id: deleted.id, text: deleted.text })));
    });
}
