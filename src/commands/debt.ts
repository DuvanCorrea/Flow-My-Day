import chalk from "chalk";
import type { Command } from "commander";
import { createActivityRepository } from "../application/factories/createActivityRepository.js";
import { readUserConfig } from "../config/userConfig.js";
import { addDebtActivity } from "../application/useCases/manageActivities.js";
import { resolveProjectSelectionForCreation } from "../application/useCases/resolveProjectSelection.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.debt;
type DebtCommandLabels = typeof DEFAULT_LABELS;

interface DebtCommandOptions {
  project?: string;
}

export function registerDebtCommand(program: Command, labels: Partial<DebtCommandLabels> = {}): void {
  const text: DebtCommandLabels = { ...DEFAULT_LABELS, ...labels };

  program
    .command("debt <text>")
    .description(text.description)
    .option("-p, --project <project>", text.optionProject)
    .action(async (text: string, options: DebtCommandOptions) => {
      const config = readUserConfig();
      const repository = createActivityRepository(config.dataFile);
      const projectSelection = await resolveProjectSelectionForCreation(repository, config, options.project);
      if (projectSelection.kind === "invalid-reference") {
        console.log(chalk.red(t(config, "projectNotFound", { project: projectSelection.reference })));
        process.exitCode = 1;
        return;
      }

      addDebtActivity(repository, text, projectSelection.projectId);
      console.log(chalk.magenta(t(config, "debt", { text })));
    });
}
