import chalk from "chalk";
import { readUserConfig } from "../config/userConfig.js";
import { listItems } from "../storage/dataStore.js";
import { t } from "../utils/messages.js";

const TYPE_ORDER = ["later", "done", "debt"];

const TYPE_STYLE = {
  later: { label: "Later", emoji: "⏳", color: chalk.yellow },
  done: { label: "Done", emoji: "✅", color: chalk.green },
  debt: { label: "Tech Debt", emoji: "🧱", color: chalk.magenta }
};

function getTypeStyle(type) {
  return TYPE_STYLE[type] || { label: type, emoji: "•", color: chalk.white };
}

function groupItemsByType(items) {
  return items.reduce((groups, item) => {
    if (!groups[item.type]) {
      groups[item.type] = [];
    }
    groups[item.type].push(item);
    return groups;
  }, {});
}

function buildRenderOrder(groupedItems) {
  const groupedTypes = Object.keys(groupedItems);
  const knownOrder = TYPE_ORDER.filter((type) => groupedTypes.includes(type));
  const customOrder = groupedTypes.filter((type) => !TYPE_ORDER.includes(type));
  return [...knownOrder, ...customOrder];
}

function renderGroupedItems(items) {
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

    const style = getTypeStyle(type);
    console.log(style.color(`${style.label} ${style.emoji} (${sectionItems.length})`));

    for (const item of sectionItems) {
      const statusTag = item.status === "done" ? chalk.green("done") : chalk.yellow("open");
      console.log("  -", style.color(`#${item.id}`), item.text, statusTag);
    }
  }
}

export function registerListCommand(program) {
  program
    .command("list")
    .description("List saved items")
    .option("-t, --type <type>", "Filter by type: done|later|debt|all", "all")
    .option("-s, --status <status>", "Filter by status: open|done|all", "all")
    .option("-l, --limit <number>", "Limit number of results")
    .option("--json", "Output as JSON", false)
    .action((options) => {
      const config = readUserConfig();
      const limit = options.limit ? Number(options.limit) : undefined;
      const items = listItems(config.dataFile, {
        type: options.type,
        status: options.status,
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

      renderGroupedItems(items);
    });
}
