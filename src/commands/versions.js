import chalk from "chalk";
import { createRequire } from "node:module";
import { formatText, getHelpText } from "../utils/helpText.js";
import { reportHandledError } from "../utils/errorHandler.js";
import { getAvailableVersions } from "../utils/npmClient.js";

const require = createRequire(import.meta.url);
const { name: packageName, version: currentVersion } = require("../../package.json");

const DEFAULT_LABELS = getHelpText("en").commands.versions;

export function registerVersionsCommand(program, labels = {}) {
  const text = { ...DEFAULT_LABELS, ...labels };

  program
    .command("versions")
    .description(text.description)
    .action(() => {
      try {
        const { versions, latestVersion } = getAvailableVersions(packageName);

        if (!versions.length) {
          console.log(chalk.yellow(text.noVersions));
          return;
        }

        console.log(chalk.cyan(formatText(text.listTitle, { package: packageName })));
        for (const version of versions) {
          const tags = [];
          if (version === latestVersion) tags.push(text.latestTag);
          if (version === currentVersion) tags.push(text.currentTag);
          const suffix = tags.length ? chalk.gray(` (${tags.join(", ")})`) : "";
          console.log(`  - ${version}${suffix}`);
        }
      } catch (error) {
        console.log(chalk.red(formatText(text.fetchFailed, { error: error.message })));
        reportHandledError(error, {
          source: "command:versions",
          argv: process.argv,
          packageName
        });
        process.exitCode = 1;
      }
    });
}
