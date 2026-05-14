import chalk from "chalk";
import type { Command } from "commander";
import { createActivityRepository } from "../application/factories/createActivityRepository.js";
import { readUserConfig } from "../config/userConfig.js";
import { addCompletedActivity } from "../application/useCases/manageActivities.js";
import { resolveProjectSelectionForCreation } from "../application/useCases/resolveProjectSelection.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.add;
type AddCommandLabels = typeof DEFAULT_LABELS;

interface AddCommandOptions {
  project?: string;
}

export function registerAddCommand(program: Command, labels: Partial<AddCommandLabels> = {}): void {
  const text: AddCommandLabels = { ...DEFAULT_LABELS, ...labels };

  program
    .command("add <text>")
    .description(text.description)
    .option("-p, --project <project>", text.optionProject)
    .action(async (text: string, options: AddCommandOptions) => {
      const config = readUserConfig();
      const repository = createActivityRepository(config.dataFile);
      const projectSelection = await resolveProjectSelectionForCreation(repository, config, options.project);
      if (projectSelection.kind === "invalid-reference") {
        console.log(chalk.red(t(config, "projectNotFound", { project: projectSelection.reference })));
        process.exitCode = 1;
        return;
      }

      addCompletedActivity(repository, text, projectSelection.projectId);
      console.log(chalk.green(t(config, "added", { text })));
    });
}
