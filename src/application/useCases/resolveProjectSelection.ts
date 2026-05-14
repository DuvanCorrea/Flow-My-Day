import chalk from "chalk";
import type { ActivityRepository } from "../../domain/repositories/activityRepository.js";
import { ensureProjectByReference, listProjects } from "./manageProjects.js";
import { canPromptProjectSelection, promptProjectSelection } from "../../utils/projectPrompt.js";
import { t } from "../../utils/messages.js";

interface RuntimeConfig {
  language: string;
  tone: string;
}

export type ResolveProjectSelectionResult =
  | { kind: "ok"; projectId: number | null }
  | { kind: "invalid-reference"; reference: string };

export async function resolveProjectSelectionForCreation(
  repository: ActivityRepository,
  config: RuntimeConfig,
  projectReference?: string
): Promise<ResolveProjectSelectionResult> {
  if (projectReference) {
    const resolved = ensureProjectByReference(repository, projectReference);
    if (!resolved) {
      return { kind: "invalid-reference", reference: projectReference };
    }

    if (resolved.created) {
      const project = repository.getProjectById(resolved.projectId as number);
      if (project) {
        console.log(chalk.blue(t(config, "projectCreated", { id: project.id, name: project.name })));
      }
    }

    return { kind: "ok", projectId: resolved.projectId };
  }

  if (!canPromptProjectSelection()) {
    return { kind: "ok", projectId: null };
  }

  const projects = listProjects(repository);
  const projectId = await promptProjectSelection(config, projects);
  return { kind: "ok", projectId };
}
