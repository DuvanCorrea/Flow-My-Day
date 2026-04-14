import chalk from "chalk";
import type { Command } from "commander";
import { createActivityRepository } from "../application/factories/createActivityRepository.js";
import { readUserConfig } from "../config/userConfig.js";
import { completeDoneTarget } from "../application/useCases/manageActivities.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.done;
type DoneCommandLabels = typeof DEFAULT_LABELS;

export function registerDoneCommand(program: Command, labels: Partial<DoneCommandLabels> = {}): void {
  const text: DoneCommandLabels = { ...DEFAULT_LABELS, ...labels };

  program
    .command("done <target>")
    .description(text.description)
    .action((target: string) => {
      const config = readUserConfig();
      const repository = createActivityRepository(config.dataFile);
      const result = completeDoneTarget(repository, target);

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
