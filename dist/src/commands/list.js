import chalk from "chalk";
import dayjs from "dayjs";
import { readUserConfig } from "../config/userConfig.js";
import { listItems } from "../storage/dataStore.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";
const DEFAULT_LABELS = getHelpText("en").commands.list;
const TYPE_ORDER = ["later", "done", "debt"];
function mergeLabels(labels = {}) {
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
function getTypeStyle(type, labels) {
    const sectionLabels = labels.sections;
    const styleMap = {
        later: { label: sectionLabels.later, emoji: "⏳", color: chalk.yellow },
        done: { label: sectionLabels.done, emoji: "✅", color: chalk.green },
        debt: { label: sectionLabels.debt, emoji: "🧱", color: chalk.magenta }
    };
    if (type in styleMap) {
        return styleMap[type];
    }
    return { label: type, emoji: "•", color: chalk.white };
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
function formatTimestamp(value, unknownTimeLabel) {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm:ss") : unknownTimeLabel;
}
function renderGroupedItems(items, labels) {
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
export function registerListCommand(program, labels = {}) {
    const text = mergeLabels(labels);
    program
        .command("list")
        .description(text.description)
        .option("-t, --type <type>", text.optionType, "all")
        .option("-s, --status <status>", text.optionStatus, "all")
        .option("-l, --limit <number>", text.optionLimit)
        .option("--json", text.optionJson, false)
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
        renderGroupedItems(items, text);
    });
}
