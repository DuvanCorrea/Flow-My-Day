import fs from "node:fs";
import path from "node:path";
import dayjs from "dayjs";
import type { ActivityStatus, FlowData } from "../domain/activity.js";

interface MarkdownStatusLabels {
  done: string;
  open: string;
}

interface MarkdownLabels {
  markdownTitle: string;
  markdownGenerated: string;
  markdownEmpty: string;
  markdownSectionDone: string;
  markdownSectionLater: string;
  markdownSectionDebt: string;
  markdownStatus: MarkdownStatusLabels;
}

type MarkdownLabelOverrides = Partial<Omit<MarkdownLabels, "markdownStatus">> & {
  markdownStatus?: Partial<MarkdownStatusLabels>;
};

interface ExportPayload {
  data: FlowData;
  format: string;
  outputPath: string;
  labels: MarkdownLabelOverrides;
}

const DEFAULT_MARKDOWN_LABELS: MarkdownLabels = {
  markdownTitle: "Flow Daily Log",
  markdownGenerated: "Generated",
  markdownEmpty: "No items.",
  markdownSectionDone: "Done",
  markdownSectionLater: "Later",
  markdownSectionDebt: "Technical Debt",
  markdownStatus: {
    done: "done",
    open: "open"
  }
};

function ensureOutputDirectory(filePath: string): void {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function mergeMarkdownLabels(labels: MarkdownLabelOverrides = {}): MarkdownLabels {
  return {
    ...DEFAULT_MARKDOWN_LABELS,
    ...labels,
    markdownStatus: {
      ...DEFAULT_MARKDOWN_LABELS.markdownStatus,
      ...(labels.markdownStatus ?? {})
    }
  };
}

function mapStatus(status: ActivityStatus, labels: MarkdownLabels): string {
  return labels.markdownStatus[status] || status;
}

export function toMarkdown(data: FlowData, labelsInput: MarkdownLabelOverrides = {}): string {
  const labels = mergeMarkdownLabels(labelsInput);
  const lines = [];
  lines.push(`# ${labels.markdownTitle}`);
  lines.push("");
  lines.push(`${labels.markdownGenerated}: ${dayjs().format("YYYY-MM-DD HH:mm")}`);
  lines.push("");

  if (!data.items.length) {
    lines.push(labels.markdownEmpty);
    return `${lines.join("\n")}\n`;
  }

  const groups = {
    done: data.items.filter((item) => item.type === "done"),
    later: data.items.filter((item) => item.type === "later"),
    debt: data.items.filter((item) => item.type === "debt")
  };

  lines.push(`## ${labels.markdownSectionDone}`);
  for (const item of groups.done) {
    lines.push(`- #${item.id} ${item.text} (${item.createdAt})`);
  }
  lines.push("");

  lines.push(`## ${labels.markdownSectionLater}`);
  for (const item of groups.later) {
    lines.push(`- #${item.id} ${item.text} [${mapStatus(item.status, labels)}]`);
  }
  lines.push("");

  lines.push(`## ${labels.markdownSectionDebt}`);
  for (const item of groups.debt) {
    lines.push(`- #${item.id} ${item.text} [${mapStatus(item.status, labels)}]`);
  }
  lines.push("");

  return `${lines.join("\n")}\n`;
}

export function exportData({ data, format, outputPath, labels }: ExportPayload): string {
  ensureOutputDirectory(outputPath);

  if (format === "json") {
    fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    return outputPath;
  }

  const markdown = toMarkdown(data, labels);
  fs.writeFileSync(outputPath, markdown, "utf8");
  return outputPath;
}
