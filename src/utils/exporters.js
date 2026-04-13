import fs from "node:fs";
import path from "node:path";
import dayjs from "dayjs";

function ensureOutputDirectory(filePath) {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

export function toMarkdown(data, title = "Flow Export") {
  const lines = [];
  lines.push(`# ${title}`);
  lines.push("");
  lines.push(`Generated: ${dayjs().format("YYYY-MM-DD HH:mm")}`);
  lines.push("");

  if (!data.items.length) {
    lines.push("No items.");
    return `${lines.join("\n")}\n`;
  }

  const groups = {
    done: data.items.filter((item) => item.type === "done"),
    later: data.items.filter((item) => item.type === "later"),
    debt: data.items.filter((item) => item.type === "debt")
  };

  lines.push("## Done");
  for (const item of groups.done) {
    lines.push(`- #${item.id} ${item.text} (${item.createdAt})`);
  }
  lines.push("");

  lines.push("## Later");
  for (const item of groups.later) {
    lines.push(`- #${item.id} ${item.text} [${item.status}]`);
  }
  lines.push("");

  lines.push("## Technical Debt");
  for (const item of groups.debt) {
    lines.push(`- #${item.id} ${item.text} [${item.status}]`);
  }
  lines.push("");

  return `${lines.join("\n")}\n`;
}

export function exportData({ data, format, outputPath }) {
  ensureOutputDirectory(outputPath);

  if (format === "json") {
    fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    return outputPath;
  }

  const markdown = toMarkdown(data, "Flow Daily Log");
  fs.writeFileSync(outputPath, markdown, "utf8");
  return outputPath;
}
