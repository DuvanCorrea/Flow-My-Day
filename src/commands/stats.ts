import chalk from "chalk";
import type { Command } from "commander";
import { readUserConfig } from "../config/userConfig.js";
import { getStats } from "../storage/dataStore.js";
import { getHelpText } from "../utils/helpText.js";

const DEFAULT_LABELS = getHelpText("en").commands.stats;
type StatsLabels = typeof DEFAULT_LABELS;
type StatsLabelOverrides = Partial<Omit<StatsLabels, "typeNames">> & {
  typeNames?: Partial<StatsLabels["typeNames"]>;
};

interface StatsCommandOptions {
  json?: boolean;
}

function mergeLabels(labels: StatsLabelOverrides = {}): StatsLabels {
  return {
    ...DEFAULT_LABELS,
    ...labels,
    typeNames: {
      ...DEFAULT_LABELS.typeNames,
      ...(labels.typeNames ?? {})
    }
  };
}

export function registerStatsCommand(program: Command, labels: StatsLabelOverrides = {}): void {
  const text = mergeLabels(labels);

  program
    .command("stats")
    .description(text.description)
    .option("--json", text.optionJson, false)
    .action((options: StatsCommandOptions) => {
      const config = readUserConfig();
      const stats = getStats(config.dataFile);

      if (options.json) {
        console.log(JSON.stringify(stats, null, 2));
        return;
      }

      console.log(chalk.cyan(text.title));
      console.log(`${text.totalLabel}: ${stats.total}`);
      console.log(chalk.green(`${text.doneLabel}: ${stats.done}`));
      console.log(chalk.yellow(`${text.openLabel}: ${stats.open}`));
      console.log(
        `${text.byTypeLabel} -> ${text.typeNames.done}:${stats.byType.done} ${text.typeNames.later}:${stats.byType.later} ${text.typeNames.debt}:${stats.byType.debt}`
      );
    });
}
