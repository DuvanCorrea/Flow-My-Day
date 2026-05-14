import chalk from "chalk";
import type { Command } from "commander";
import { createActivityRepository } from "../application/factories/createActivityRepository.js";
import { readUserConfig } from "../config/userConfig.js";
import { completeDoneTarget } from "../application/useCases/manageActivities.js";
import { resolveProjectSelectionForCreation } from "../application/useCases/resolveProjectSelection.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.done;
type DoneCommandLabels = typeof DEFAULT_LABELS;

interface DoneCommandOptions {
  project?: string;
}

function isLikelyItemIdTarget(target: string): boolean {
  return /^[+-]?\d+$/.test(String(target).trim());
}

export function registerDoneCommand(program: Command, labels: Partial<DoneCommandLabels> = {}): void {
  const text: DoneCommandLabels = { ...DEFAULT_LABELS, ...labels };

  program
    .command("done <target>")
    .description(text.description)
    .option("-p, --project <project>", text.optionProject)
    .action(async (target: string, options: DoneCommandOptions) => {
      const config = readUserConfig();
      const repository = createActivityRepository(config.dataFile);
      let projectId: number | null = null;

      // Project selection only applies when done creates a new activity from text.
      if (!isLikelyItemIdTarget(target)) {
        const projectSelection = await resolveProjectSelectionForCreation(repository, config, options.project);
        if (projectSelection.kind === "invalid-reference") {
          console.log(chalk.red(t(config, "projectNotFound", { project: projectSelection.reference })));
          process.exitCode = 1;
          return;
        }
        projectId = projectSelection.projectId;
      }

      const result = completeDoneTarget(repository, target, projectId);

      if (result.kind === "created" || result.kind === "updated") {
        console.log(chalk.green(t(config, "done", { id: result.item.id })));
        return;
      }

      if (result.kind === "invalid-id") {
        console.log(chalk.red(t(config, "invalidId", { id: result.rawTarget })));
        process.exitCode = 1;
        return;
      }

      console.log(chalk.red(t(config, "notFound", { id: result.id })));
      process.exitCode = 1;
    });
}
