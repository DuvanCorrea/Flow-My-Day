import chalk from "chalk";
import dayjs from "dayjs";
import type { Command } from "commander";
import { readUserConfig } from "../config/userConfig.js";
import { listItems } from "../storage/dataStore.js";
import type { Activity, ListActivityOptions } from "../domain/activity.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

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
  json?: boolean;
}

interface TypeStyle {
  label: string;
  emoji: string;
  color: (value: string) => string;
}

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

function renderGroupedItems(items: Activity[], labels: ListLabels): void {
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
      console.log("  -", style.color(`#${item.id}`), statusTag, item.text, createdAt);
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
    .option("--json", text.optionJson, false)
    .action((options: ListCommandOptions) => {
      const config = readUserConfig();
      const limit = options.limit ? Number(options.limit) : undefined;
      const items = listItems(config.dataFile, {
        type: options.type as ListActivityOptions["type"],
        status: options.status as ListActivityOptions["status"],
        limit
      });

      if (options.json) {
        console.log(JSON.stringify(items, null, 2));
        return;
      }

      if (!items.length) {
        console.log(chalk.gray(t(config, "emptyList")));
        return;
      }

      renderGroupedItems(items, text);
    });
}
