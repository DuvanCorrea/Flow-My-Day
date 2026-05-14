import type { Project } from "../../domain/activity.js";
import type { ActivityRepository } from "../../domain/repositories/activityRepository.js";

export interface DeleteProjectResult {
  project: Project;
  orphanedItems: number;
}

export type RenameProjectResult =
  | { kind: "renamed"; project: Project }
  | { kind: "invalid-id"; rawId: number | string }
  | { kind: "empty-name" }
  | { kind: "not-found"; id: number }
  | { kind: "name-taken"; name: string };

export function listProjects(repository: ActivityRepository): Project[] {
  return repository.listProjects();
}

export function ensureProjectByReference(
  repository: ActivityRepository,
  reference: string
): { projectId: number | null; created: boolean; foundById: boolean } | null {
  const normalized = String(reference).trim();
  if (!normalized) {
    return null;
  }

  if (/^[+-]?\d+$/.test(normalized)) {
    const id = Number(normalized);
    if (!Number.isSafeInteger(id) || id < 0) {
      return null;
    }

    if (id === 0) {
      return { projectId: null, created: false, foundById: true };
    }

    const project = repository.getProjectById(id);
    if (!project) {
      return null;
    }

    return { projectId: project.id, created: false, foundById: true };
  }

  const byName = repository.getProjectByName(normalized);
  if (byName) {
    return { projectId: byName.id, created: false, foundById: false };
  }

  const created = repository.createProject(normalized);
  return { projectId: created.id, created: true, foundById: false };
}

export function createProjectByName(repository: ActivityRepository, name: string): Project | null {
  const normalized = String(name).trim();
  if (!normalized) {
    return null;
  }

  const existing = repository.getProjectByName(normalized);
  if (existing) {
    return existing;
  }

  return repository.createProject(normalized);
}

export function removeProjectById(repository: ActivityRepository, projectId: number): DeleteProjectResult | null {
  if (!Number.isSafeInteger(projectId) || projectId <= 0) {
    return null;
  }

  return repository.deleteProject(projectId);
}

export function renameProjectById(
  repository: ActivityRepository,
  projectId: number | string,
  nextName: string
): RenameProjectResult {
  const id = Number(projectId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return { kind: "invalid-id", rawId: projectId };
  }

  const normalizedName = String(nextName).trim();
  if (!normalizedName) {
    return { kind: "empty-name" };
  }

  const existingByName = repository.getProjectByName(normalizedName);
  if (existingByName && existingByName.id !== id) {
    return { kind: "name-taken", name: normalizedName };
  }

  const renamed = repository.renameProjectById(id, normalizedName);
  if (!renamed) {
    return { kind: "not-found", id };
  }

  return { kind: "renamed", project: renamed };
}
