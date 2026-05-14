import chalk from "chalk";
import type { Command } from "commander";
import { createActivityRepository } from "../application/factories/createActivityRepository.js";
import { readUserConfig } from "../config/userConfig.js";
import { getHelpText } from "../utils/helpText.js";
import { applyActivityFilters, buildStatsFromItems, resolveActivityFilters } from "../utils/activityFilters.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.stats;
type StatsLabels = typeof DEFAULT_LABELS;
type StatsLabelOverrides = Partial<Omit<StatsLabels, "typeNames">> & {
  typeNames?: Partial<StatsLabels["typeNames"]>;
};

interface StatsCommandOptions {
  project?: string;
  today?: boolean;
  week?: boolean;
  month?: boolean;
  date?: string;
  from?: string;
  to?: string;
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
    .option("-p, --project <project>", text.optionProject)
    .option("--today", text.optionToday, false)
    .option("--week", text.optionWeek, false)
    .option("--month", text.optionMonth, false)
    .option("-d, --date <YYYY-MM-DD>", text.optionDate)
    .option("--from <YYYY-MM-DD>", text.optionFrom)
    .option("--to <YYYY-MM-DD>", text.optionTo)
    .option("--json", text.optionJson, false)
    .action((options: StatsCommandOptions) => {
      const config = readUserConfig();
      const repository = createActivityRepository(config.dataFile);
      const data = repository.read();
      const filterResult = resolveActivityFilters(options, data.projects);

      if (filterResult.kind === "date-filter-conflict") {
        console.log(chalk.red(t(config, "listDateFilterConflict")));
        process.exitCode = 1;
        return;
      }

      if (filterResult.kind === "invalid-date") {
        console.log(chalk.red(t(config, "invalidDate", { date: filterResult.value })));
        process.exitCode = 1;
        return;
      }

      if (filterResult.kind === "invalid-date-range") {
        console.log(chalk.red(t(config, "invalidDateRange", { from: filterResult.from, to: filterResult.to })));
        process.exitCode = 1;
        return;
      }

      if (filterResult.kind === "project-not-found") {
        console.log(chalk.red(t(config, "projectNotFound", { project: filterResult.reference })));
        process.exitCode = 1;
        return;
      }

      const items = repository.list();
      const stats = buildStatsFromItems(applyActivityFilters(items, filterResult.filters));

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
