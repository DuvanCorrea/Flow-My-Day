import chalk from "chalk";
import dayjs from "dayjs";
import type { Command } from "commander";
import { createActivityRepository } from "../application/factories/createActivityRepository.js";
import { readUserConfig } from "../config/userConfig.js";
import type { Activity, ListActivityOptions } from "../domain/activity.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";
import { applyActivityFilters, resolveActivityFilters } from "../utils/activityFilters.js";

const DEFAULT_LABELS = getHelpText("en").commands.list;
type ListLabels = typeof DEFAULT_LABELS;
type SectionType = "later" | "done" | "debt";
type ListLabelOverrides = Partial<Omit<ListLabels, "sections" | "status">> & {
  sections?: Partial<ListLabels["sections"]>;
  status?: Partial<ListLabels["status"]>;
};

interface ListCommandOptions {
  type?: string;
  status?: string;
  limit?: string;
  project?: string;
  today?: boolean;
  week?: boolean;
  month?: boolean;
  date?: string;
  from?: string;
  to?: string;
  json?: boolean;
}

interface TypeStyle {
  label: string;
  emoji: string;
  color: (value: string) => string;
}

type RenderListLabels = ListLabels & {
  projectsById: Map<number, string>;
};

const TYPE_ORDER: SectionType[] = ["later", "done", "debt"];

function mergeLabels(labels: ListLabelOverrides = {}): ListLabels {
  return {
    ...DEFAULT_LABELS,
    ...labels,
    sections: {
      ...DEFAULT_LABELS.sections,
      ...(labels.sections ?? {})
    },
    status: {
      ...DEFAULT_LABELS.status,
      ...(labels.status ?? {})
    }
  };
}

function getTypeStyle(type: string, labels: ListLabels): TypeStyle {
  const sectionLabels = labels.sections;
  const styleMap: Record<SectionType, TypeStyle> = {
    later: { label: sectionLabels.later, emoji: "⏳", color: chalk.yellow },
    done: { label: sectionLabels.done, emoji: "✅", color: chalk.green },
    debt: { label: sectionLabels.debt, emoji: "🧱", color: chalk.magenta }
  };

  if (type in styleMap) {
    return styleMap[type as SectionType];
  }

  return { label: type, emoji: "•", color: chalk.white };
}

function groupItemsByType(items: Activity[]): Record<string, Activity[]> {
  return items.reduce((groups, item) => {
    if (!groups[item.type]) {
      groups[item.type] = [];
    }
    groups[item.type].push(item);
    return groups;
  }, {});
}

function buildRenderOrder(groupedItems: Record<string, Activity[]>): string[] {
  const groupedTypes = Object.keys(groupedItems);
  const knownOrder = TYPE_ORDER.filter((type) => groupedTypes.includes(type));
  const customOrder = groupedTypes.filter((type) => !TYPE_ORDER.includes(type as SectionType));
  return [...knownOrder, ...customOrder];
}

function formatTimestamp(value: string, unknownTimeLabel: string): string {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm:ss") : unknownTimeLabel;
}

function renderGroupedItems(items: Activity[], labels: RenderListLabels): void {
  const groupedItems = groupItemsByType(items);
  const renderOrder = buildRenderOrder(groupedItems);
  let hasPrintedSection = false;

  for (const type of renderOrder) {
    const sectionItems = groupedItems[type] || [];
    if (!sectionItems.length) {
      continue;
    }

    if (hasPrintedSection) {
      console.log("");
    }
    hasPrintedSection = true;

    const style = getTypeStyle(type, labels);
    console.log(style.color(`${style.label} ${style.emoji} (${sectionItems.length})`));

    for (const item of sectionItems) {
      const statusTag = item.status === "done"
        ? chalk.green(labels.status.done)
        : chalk.yellow(labels.status.open);
      const createdAt = chalk.gray(`[${formatTimestamp(item.createdAt, labels.unknownTime)}]`);
      const projectName = item.projectId ? labels.projectsById.get(item.projectId) || labels.projectNone : labels.projectNone;
      const projectTag = chalk.cyan(`[${labels.projectLabel}: ${projectName}]`);
      console.log("  -", style.color(`#${item.id}`), statusTag, projectTag, item.text, createdAt);
    }
  }
}

export function registerListCommand(program: Command, labels: ListLabelOverrides = {}): void {
  const text = mergeLabels(labels);

  program
    .command("list")
    .description(text.description)
    .option("-t, --type <type>", text.optionType, "all")
    .option("-s, --status <status>", text.optionStatus, "all")
    .option("-l, --limit <number>", text.optionLimit)
    .option("-p, --project <project>", text.optionProject)
    .option("--today", text.optionToday, false)
    .option("--week", text.optionWeek, false)
    .option("--month", text.optionMonth, false)
    .option("-d, --date <YYYY-MM-DD>", text.optionDate)
    .option("--from <YYYY-MM-DD>", text.optionFrom)
    .option("--to <YYYY-MM-DD>", text.optionTo)
    .option("--json", text.optionJson, false)
    .action((options: ListCommandOptions) => {
      const config = readUserConfig();
      const repository = createActivityRepository(config.dataFile);
      const data = repository.read();
      const projectsById = new Map<number, string>(data.projects.map((project) => [project.id, project.name]));

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

      const limit = options.limit ? Number(options.limit) : undefined;
      let items = repository.list({
        type: options.type as ListActivityOptions["type"],
        status: options.status as ListActivityOptions["status"]
      });

      items = applyActivityFilters(items, filterResult.filters);

      if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
        items = items.slice(0, limit);
      }

      if (options.json) {
        console.log(JSON.stringify(items, null, 2));
        return;
      }

      if (!items.length) {
        console.log(chalk.gray(t(config, "emptyList")));
        return;
      }

      renderGroupedItems(items, { ...text, projectsById });
    });
}
