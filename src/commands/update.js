import chalk from "chalk";
import { createRequire } from "node:module";
import { formatText, getHelpText } from "../utils/helpText.js";
import { reportHandledError } from "../utils/errorHandler.js";
import { getAvailableVersions, installGlobalVersion } from "../utils/npmClient.js";

const require = createRequire(import.meta.url);
const { name: packageName, version: currentVersion } = require("../../package.json");

const DEFAULT_LABELS = getHelpText("en").commands.update;

function resolveTargetVersion(requestedVersion, latestVersion, versions) {
  if (!requestedVersion || requestedVersion === "latest") {
    return latestVersion;
  }

  if (versions.includes(requestedVersion)) {
    return requestedVersion;
  }

  return null;
}

export function registerUpdateCommand(program, labels = {}) {
  const text = { ...DEFAULT_LABELS, ...labels };

  program
    .command("update [version]")
    .description(text.description)
    .option("--dry-run", text.optionDryRun, false)
    .action((versionArg, options) => {
      try {
        if (options.dryRun && versionArg && versionArg !== "latest") {
          console.log(chalk.cyan(formatText(text.dryRunCommand, {
            package: packageName,
            version: versionArg
          })));
          return;
        }

        const { versions, latestVersion } = getAvailableVersions(packageName);

        if (!versions.length || !latestVersion) {
          console.log(chalk.yellow(text.noVersions));
          process.exitCode = 1;
          return;
        }

        const targetVersion = resolveTargetVersion(versionArg, latestVersion, versions);
        if (!targetVersion) {
          console.log(chalk.red(formatText(text.versionNotAvailable, { version: versionArg })));
          process.exitCode = 1;
          return;
        }

        if (targetVersion === currentVersion) {
          console.log(chalk.green(formatText(text.alreadyUpToDate, { version: currentVersion })));
          return;
        }

        if (options.dryRun) {
          console.log(chalk.cyan(formatText(text.dryRunCommand, {
            package: packageName,
            version: targetVersion
          })));
          return;
        }

        console.log(chalk.cyan(formatText(text.installing, {
          package: packageName,
          version: targetVersion
        })));

        installGlobalVersion(packageName, targetVersion);
        console.log(chalk.green(formatText(text.updateSuccess, { version: targetVersion })));
      } catch (error) {
        console.log(chalk.red(formatText(text.updateFailed, { error: error.message })));
        reportHandledError(error, {
          source: "command:update",
          argv: process.argv,
          packageName,
          requestedVersion: versionArg || "latest"
        });
        process.exitCode = 1;
      }
    });
}
