import chalk from "chalk";
import { getUserConfigPath, readUserConfig, resetUserConfig, setUserConfigValue } from "../config/userConfig.js";
import { SUPPORTED_EXPORT_FORMATS, SUPPORTED_LANGUAGES, SUPPORTED_TONES } from "../config/defaults.js";
import { formatText, getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";
const DEFAULT_LABELS = getHelpText("en").commands.config;
function parseValue(value) {
    const trimmed = String(value).trim();
    if (trimmed === "true")
        return true;
    if (trimmed === "false")
        return false;
    if (!Number.isNaN(Number(trimmed)) && trimmed !== "")
        return Number(trimmed);
    try {
        return JSON.parse(trimmed);
    }
    catch {
        return trimmed;
    }
}
function getByPath(target, keyPath) {
    return keyPath.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), target);
}
function validateKnownKey(key, value, labels) {
    if (key === "language" && !SUPPORTED_LANGUAGES.includes(value)) {
        return formatText(labels.validationLanguage, {
            supported: SUPPORTED_LANGUAGES.join("|")
        });
    }
    if (key === "tone" && !SUPPORTED_TONES.includes(value)) {
        return formatText(labels.validationTone, {
            supported: SUPPORTED_TONES.join("|")
        });
    }
    if (key === "exportFormat" && !SUPPORTED_EXPORT_FORMATS.includes(value)) {
        return formatText(labels.validationExportFormat, {
            supported: SUPPORTED_EXPORT_FORMATS.join("|")
        });
    }
    return null;
}
export function registerConfigCommand(program, labels = {}) {
    const text = { ...DEFAULT_LABELS, ...labels };
    const configCommand = program
        .command("config")
        .description(text.description);
    configCommand.action(() => {
        const config = readUserConfig();
        console.log(chalk.cyan(`${text.configPathLabel}: ${getUserConfigPath()}`));
        console.log(JSON.stringify(config, null, 2));
    });
    configCommand
        .command("get <key>")
        .description(text.getDescription)
        .action((key) => {
        const config = readUserConfig();
        const value = getByPath(config, key);
        if (value === undefined) {
            console.log(chalk.red(formatText(text.keyNotFound, { key })));
            process.exitCode = 1;
            return;
        }
        if (typeof value === "object") {
            console.log(JSON.stringify(value, null, 2));
            return;
        }
        console.log(value);
    });
    configCommand
        .command("set <key> <value>")
        .description(text.setDescription)
        .action((key, value) => {
        const parsedValue = parseValue(value);
        const validationError = validateKnownKey(key, parsedValue, text);
        if (validationError) {
            console.log(chalk.red(validationError));
            process.exitCode = 1;
            return;
        }
        const updated = setUserConfigValue(key, parsedValue);
        console.log(chalk.green(t(updated, "configUpdated")));
    });
    configCommand
        .command("reset")
        .description(text.resetDescription)
        .action(() => {
        const reset = resetUserConfig();
        console.log(chalk.yellow(t(reset, "configReset")));
    });
}
