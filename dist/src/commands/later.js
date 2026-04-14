import chalk from "chalk";
import { readUserConfig } from "../config/userConfig.js";
import { addItem } from "../storage/dataStore.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";
const DEFAULT_LABELS = getHelpText("en").commands.later;
export function registerLaterCommand(program, labels = {}) {
    const text = { ...DEFAULT_LABELS, ...labels };
    program
        .command("later <text>")
        .description(text.description)
        .action((text) => {
        const config = readUserConfig();
        const activity = { type: "later", text, status: "open" };
        addItem(config.dataFile, activity);
        console.log(chalk.yellow(t(config, "later", { text })));
    });
}
