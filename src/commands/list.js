import chalk from "chalk";
import { readUserConfig } from "../config/userConfig.js";
import { listItems } from "../storage/dataStore.js";
import { t } from "../utils/messages.js";

function colorByType(type) {
  if (type === "done") return chalk.green;
  if (type === "later") return chalk.yellow;
  if (type === "debt") return chalk.magenta;
  return chalk.white;
}

export function registerListCommand(program) {
  program
    .command("list")
    .description("Listar items guardados")
    .option("-t, --type <type>", "Filtrar por tipo: done|later|debt|all", "all")
    .option("-s, --status <status>", "Filtrar por estado: open|done|all", "all")
    .option("-l, --limit <number>", "Limitar cantidad de resultados")
    .option("--json", "Mostrar salida en JSON", false)
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

      for (const item of items) {
        const painter = colorByType(item.type);
        const statusTag = item.status === "done" ? chalk.green("done") : chalk.yellow("open");
        console.log(painter(`#${item.id}`), item.text, chalk.gray(`[${item.type}]`), statusTag);
      }
    });
}
