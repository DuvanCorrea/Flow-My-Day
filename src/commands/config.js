import chalk from "chalk";
import {
  getUserConfigPath,
  readUserConfig,
  resetUserConfig,
  setUserConfigValue
} from "../config/userConfig.js";
import {
  SUPPORTED_EXPORT_FORMATS,
  SUPPORTED_LANGUAGES,
  SUPPORTED_TONES
} from "../config/defaults.js";
import { t } from "../utils/messages.js";

function parseValue(value) {
  const trimmed = String(value).trim();

  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (!Number.isNaN(Number(trimmed)) && trimmed !== "") return Number(trimmed);

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

function getByPath(target, keyPath) {
  return keyPath.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), target);
}

function validateKnownKey(key, value) {
  if (key === "language" && !SUPPORTED_LANGUAGES.includes(value)) {
    return `language debe ser: ${SUPPORTED_LANGUAGES.join("|")}`;
  }

  if (key === "tone" && !SUPPORTED_TONES.includes(value)) {
    return `tone debe ser: ${SUPPORTED_TONES.join("|")}`;
  }

  if (key === "exportFormat" && !SUPPORTED_EXPORT_FORMATS.includes(value)) {
    return `exportFormat debe ser: ${SUPPORTED_EXPORT_FORMATS.join("|")}`;
  }

  return null;
}

export function registerConfigCommand(program) {
  const configCommand = program
    .command("config")
    .description("Ver y actualizar configuracion de usuario");

  configCommand.action(() => {
    const config = readUserConfig();
    console.log(chalk.cyan(`Config path: ${getUserConfigPath()}`));
    console.log(JSON.stringify(config, null, 2));
  });

  configCommand
    .command("get <key>")
    .description("Leer una propiedad de configuracion")
    .action((key) => {
      const config = readUserConfig();
      const value = getByPath(config, key);
      if (value === undefined) {
        console.log(chalk.red(`No existe la clave: ${key}`));
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
    .description("Guardar una propiedad de configuracion")
    .action((key, value) => {
      const current = readUserConfig();
      const parsedValue = parseValue(value);
      const validationError = validateKnownKey(key, parsedValue);

      if (validationError) {
        console.log(chalk.red(validationError));
        process.exitCode = 1;
        return;
      }

      setUserConfigValue(key, parsedValue);
      console.log(chalk.green(t(current, "configUpdated")));
    });

  configCommand
    .command("reset")
    .description("Restaurar configuracion por defecto")
    .action(() => {
      const current = readUserConfig();
      resetUserConfig();
      console.log(chalk.yellow(t(current, "configReset")));
    });
}
