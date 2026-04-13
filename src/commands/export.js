import path from "node:path";
import dayjs from "dayjs";
import chalk from "chalk";
import { readUserConfig } from "../config/userConfig.js";
import { SUPPORTED_EXPORT_FORMATS } from "../config/defaults.js";
import { readData } from "../storage/dataStore.js";
import { exportData } from "../utils/exporters.js";
import { formatText, getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.export;

function resolveOutputPath(output, format) {
  if (output) {
    return path.resolve(output);
  }

  const filename = `flow-export-${dayjs().format("YYYY-MM-DD")}.${format}`;
  return path.resolve(process.cwd(), filename);
}

export function registerExportCommand(program, labels = {}) {
  const text = {
    ...DEFAULT_LABELS,
    ...labels,
    markdownStatus: {
      ...DEFAULT_LABELS.markdownStatus,
      ...(labels.markdownStatus || {})
    }
  };

  program
    .command("export [output]")
    .description(text.description)
    .option("-f, --format <format>", text.optionFormat)
    .action((output, options) => {
      const config = readUserConfig();
      const format = options.format || config.exportFormat;

      if (!SUPPORTED_EXPORT_FORMATS.includes(format)) {
        console.log(chalk.red(formatText(text.invalidFormat, { format })));
        process.exitCode = 1;
        return;
      }

      const data = readData(config.dataFile);
      const outputPath = resolveOutputPath(output, format);

      exportData({ data, format, outputPath, labels: text });
      console.log(chalk.blue(t(config, "exportOk", { path: outputPath })));
    });
}
