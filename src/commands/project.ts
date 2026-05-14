import chalk from "chalk";
import type { Command } from "commander";
import { createActivityRepository } from "../application/factories/createActivityRepository.js";
import {
  createProjectByName,
  listProjects,
  removeProjectById,
  renameProjectById
} from "../application/useCases/manageProjects.js";
import { readUserConfig } from "../config/userConfig.js";
import { getHelpText } from "../utils/helpText.js";
import { t } from "../utils/messages.js";

const DEFAULT_LABELS = getHelpText("en").commands.project;
type ProjectCommandLabels = typeof DEFAULT_LABELS;

interface ProjectListOptions {
  json?: boolean;
}

function printProjects(
  repository: ReturnType<typeof createActivityRepository>,
  config: { language: string; tone: string },
  labels: ProjectCommandLabels,
  asJson: boolean
): void {
  const projects = listProjects(repository);

  if (asJson) {
    console.log(JSON.stringify(projects, null, 2));
    return;
  }

  if (!projects.length) {
    console.log(chalk.gray(t(config, "noProjects")));
    return;
  }

  console.log(chalk.cyan(labels.title));
  for (const project of projects) {
    console.log(`  ${project.id}) ${project.name}`);
  }
}

export function registerProjectCommand(program: Command, labels: Partial<ProjectCommandLabels> = {}): void {
  const text: ProjectCommandLabels = { ...DEFAULT_LABELS, ...labels };

  const projectCommand = program
    .command("project")
    .description(text.description);

  projectCommand
    .action(() => {
      const config = readUserConfig();
      const repository = createActivityRepository(config.dataFile);
      printProjects(repository, config, text, false);
    });

  projectCommand
    .command("list")
    .description(text.listDescription)
    .option("--json", text.optionJson, false)
    .action((options: ProjectListOptions) => {
      const config = readUserConfig();
      const repository = createActivityRepository(config.dataFile);
      printProjects(repository, config, text, Boolean(options.json));
    });

  projectCommand
    .command("add <name>")
    .description(text.addDescription)
    .action((name: string) => {
      const config = readUserConfig();
      const repository = createActivityRepository(config.dataFile);
      const project = createProjectByName(repository, name);

      if (!project) {
        console.log(chalk.red(t(config, "projectNameRequired")));
        process.exitCode = 1;
        return;
      }

      console.log(chalk.green(t(config, "projectCreated", { id: project.id, name: project.name })));
    });

  projectCommand
    .command("remove <id>")
    .description(text.removeDescription)
    .action((id: string) => {
      const config = readUserConfig();
      const repository = createActivityRepository(config.dataFile);
      const parsedId = Number(id);

      if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
        console.log(chalk.red(t(config, "invalidId", { id })));
        process.exitCode = 1;
        return;
      }

      const result = removeProjectById(repository, parsedId);
      if (!result) {
        console.log(chalk.red(t(config, "projectNotFound", { project: id })));
        process.exitCode = 1;
        return;
      }

      console.log(
        chalk.yellow(
          t(config, "projectDeleted", {
            id: result.project.id,
            name: result.project.name,
            count: result.orphanedItems
          })
        )
      );
    });

  projectCommand
    .command("rename <id> <name>")
    .description(text.renameDescription)
    .action((id: string, name: string) => {
      const config = readUserConfig();
      const repository = createActivityRepository(config.dataFile);
      const result = renameProjectById(repository, id, name);

      if (result.kind === "invalid-id") {
        console.log(chalk.red(t(config, "invalidId", { id: result.rawId })));
        process.exitCode = 1;
        return;
      }

      if (result.kind === "empty-name") {
        console.log(chalk.red(t(config, "projectNameRequired")));
        process.exitCode = 1;
        return;
      }

      if (result.kind === "not-found") {
        console.log(chalk.red(t(config, "projectNotFound", { project: result.id })));
        process.exitCode = 1;
        return;
      }

      if (result.kind === "name-taken") {
        console.log(chalk.red(t(config, "projectNameTaken", { name: result.name })));
        process.exitCode = 1;
        return;
      }

      console.log(chalk.green(t(config, "projectRenamed", { id: result.project.id, name: result.project.name })));
    });
}
