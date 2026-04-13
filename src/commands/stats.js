import chalk from "chalk";
import { readUserConfig } from "../config/userConfig.js";
import { getStats } from "../storage/dataStore.js";

export function registerStatsCommand(program) {
  program
    .command("stats")
    .description("Mostrar metricas rapidas de productividad")
    .option("--json", "Mostrar salida en JSON", false)
    .action((options) => {
      const config = readUserConfig();
      const stats = getStats(config.dataFile);

      if (options.json) {
        console.log(JSON.stringify(stats, null, 2));
        return;
      }

      console.log(chalk.cyan("Flow Stats"));
      console.log(`Total: ${stats.total}`);
      console.log(chalk.green(`Done: ${stats.done}`));
      console.log(chalk.yellow(`Open: ${stats.open}`));
      console.log(`By type -> done:${stats.byType.done} later:${stats.byType.later} debt:${stats.byType.debt}`);
    });
}
