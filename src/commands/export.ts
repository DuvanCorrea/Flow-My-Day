import path from "node:path";
import dayjs from "dayjs";
import chalk from "chalk";
import type { Command } from "commander";
import { createActivityRepository } from "../application/factories/createActivityRepository.js";
import { readUserConfig } from "../config/userConfig.js";
import { SUPPORTED_EXPORT_FORMATS } from "../config/defaults.js";
import { exportData } from "../utils/exporters.js";
import { formatText, getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.export;
type ExportLabels = typeof DEFAULT_LABELS;
type ExportLabelOverrides = Partial<Omit<ExportLabels, "markdownStatus">> & {
  markdownStatus?: Partial<ExportLabels["markdownStatus"]>;
};

interface ExportCommandOptions {
  format?: string;
}

function resolveOutputPath(output: string | undefined, format: string): string {
  if (output) {
    return path.resolve(output);
  }

  const filename = `flow-export-${dayjs().format("YYYY-MM-DD")}.${format}`;
  return path.resolve(process.cwd(), filename);
}

export function registerExportCommand(program: Command, labels: ExportLabelOverrides = {}): void {
  const text: ExportLabels = {
    ...DEFAULT_LABELS,
    ...labels,
    markdownStatus: {
      ...DEFAULT_LABELS.markdownStatus,
      ...(labels.markdownStatus ?? {})
    }
  };

  program
    .command("export [output]")
    .description(text.description)
    .option("-f, --format <format>", text.optionFormat)
    .action((output: string | undefined, options: ExportCommandOptions) => {
      const config = readUserConfig();
      const format = options.format || config.exportFormat;

      if (!SUPPORTED_EXPORT_FORMATS.includes(format)) {
        console.log(chalk.red(formatText(text.invalidFormat, { format })));
        process.exitCode = 1;
        return;
      }

      const repository = createActivityRepository(config.dataFile);
      const data = repository.read();
      const outputPath = resolveOutputPath(output, format);

      exportData({ data, format, outputPath, labels: text });
      console.log(chalk.blue(t(config, "exportOk", { path: outputPath })));
    });
}
