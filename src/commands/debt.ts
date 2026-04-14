import chalk from "chalk";
import type { Command } from "commander";
import { createActivityRepository } from "../application/factories/createActivityRepository.js";
import { readUserConfig } from "../config/userConfig.js";
import { addDebtActivity } from "../application/useCases/manageActivities.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.debt;
type DebtCommandLabels = typeof DEFAULT_LABELS;

export function registerDebtCommand(program: Command, labels: Partial<DebtCommandLabels> = {}): void {
  const text: DebtCommandLabels = { ...DEFAULT_LABELS, ...labels };

  program
    .command("debt <text>")
    .description(text.description)
    .action((text: string) => {
      const config = readUserConfig();
      const repository = createActivityRepository(config.dataFile);
      addDebtActivity(repository, text);
      console.log(chalk.magenta(t(config, "debt", { text })));
    });
}
