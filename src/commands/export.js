import path from "node:path";
import dayjs from "dayjs";
import chalk from "chalk";
import { readUserConfig } from "../config/userConfig.js";
import { SUPPORTED_EXPORT_FORMATS } from "../config/defaults.js";
import { readData } from "../storage/dataStore.js";
import { exportData } from "../utils/exporters.js";
import { t } from "../utils/messages.js";

function resolveOutputPath(output, format) {
  if (output) {
    return path.resolve(output);
  }

  const filename = `flow-export-${dayjs().format("YYYY-MM-DD")}.${format}`;
  return path.resolve(process.cwd(), filename);
}

export function registerExportCommand(program) {
  program
    .command("export [output]")
    .description("Exportar tus datos a JSON o Markdown")
    .option("-f, --format <format>", "Formato de exportacion: json|md")
    .action((output, options) => {
      const config = readUserConfig();
      const format = options.format || config.exportFormat;

      if (!SUPPORTED_EXPORT_FORMATS.includes(format)) {
        console.log(chalk.red(`Formato invalido: ${format}. Usa json o md.`));
        process.exitCode = 1;
        return;
      }

      const data = readData(config.dataFile);
      const outputPath = resolveOutputPath(output, format);

      exportData({ data, format, outputPath });
      console.log(chalk.blue(t(config, "exportOk", { path: outputPath })));
    });
}
