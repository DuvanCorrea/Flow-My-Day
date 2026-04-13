import chalk from "chalk";
import { readUserConfig } from "../config/userConfig.js";
import { getStats } from "../storage/dataStore.js";

const DEFAULT_LABELS = {
  description: "Show quick productivity metrics",
  optionJson: "Output as JSON",
  title: "Flow Stats",
  totalLabel: "Total",
  doneLabel: "Done",
  openLabel: "Open",
  byTypeLabel: "By type",
  typeNames: {
    done: "done",
    later: "later",
    debt: "debt"
  }
};

function mergeLabels(labels = {}) {
  return {
    ...DEFAULT_LABELS,
    ...labels,
    typeNames: {
      ...DEFAULT_LABELS.typeNames,
      ...(labels.typeNames || {})
    }
  };
}

export function registerStatsCommand(program, labels = {}) {
  const text = mergeLabels(labels);

  program
    .command("stats")
    .description(text.description)
    .option("--json", text.optionJson, false)
    .action((options) => {
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
