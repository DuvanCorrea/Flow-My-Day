import chalk from "chalk";
import type { Command } from "commander";
import { createActivityRepository } from "../application/factories/createActivityRepository.js";
import { editActivityText } from "../application/useCases/manageActivities.js";
import { readUserConfig } from "../config/userConfig.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.edit;
type EditCommandLabels = typeof DEFAULT_LABELS;

interface EditCommandOptions {
  new?: string;
}

export function registerEditCommand(program: Command, labels: Partial<EditCommandLabels> = {}): void {
  const text: EditCommandLabels = { ...DEFAULT_LABELS, ...labels };

  program
    .command("edit <id>")
    .description(text.description)
    .option("-n, --new <text>", text.optionNew)
    .action((id: string, options: EditCommandOptions) => {
      const config = readUserConfig();
      const repository = createActivityRepository(config.dataFile);

      if (!options.new) {
        console.log(chalk.red(t(config, "editMissingNew")));
        process.exitCode = 1;
        return;
      }

      const result = editActivityText(repository, id, options.new);
      if (result.kind === "invalid-id") {
        console.log(chalk.red(t(config, "invalidId", { id: result.rawId })));
        process.exitCode = 1;
        return;
      }

      if (result.kind === "empty-text") {
        console.log(chalk.red(t(config, "editMissingNew")));
        process.exitCode = 1;
        return;
      }

      if (result.kind === "not-found") {
        console.log(chalk.red(t(config, "notFound", { id: result.id })));
        process.exitCode = 1;
        return;
      }

      console.log(chalk.green(t(config, "edited", { id: result.item.id, text: result.item.text })));
    });
}
