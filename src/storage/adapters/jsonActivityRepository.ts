import type {
  Activity,
  ActivityStats,
  AddActivityInput,
  FlowData,
  ListActivityOptions,
  Project
} from "../../domain/activity.js";
import type { ActivityRepository } from "../../domain/repositories/activityRepository.js";
import {
  addItem,
  createProject,
  deleteItem,
  deleteProject,
  getProjectById,
  getProjectByName,
  getStats,
  listItems,
  listProjects,
  markItemDone,
  readData,
  renameProject,
  restoreUndoSnapshot,
  updateItemText
} from "../dataStore.js";

export class JsonActivityRepository implements ActivityRepository {
  private readonly dataFile: string;

  constructor(dataFile: string) {
    this.dataFile = dataFile;
  }

  add(input: AddActivityInput): Activity {
    return addItem(this.dataFile, input);
  }

  markDoneById(itemId: number | string): Activity | null {
    return markItemDone(this.dataFile, itemId);
  }

  updateTextById(itemId: number | string, newText: string): Activity | null {
    return updateItemText(this.dataFile, itemId, newText);
  }

  deleteById(itemId: number | string): Activity | null {
    return deleteItem(this.dataFile, itemId);
  }

  list(options: ListActivityOptions = {}): Activity[] {
    return listItems(this.dataFile, options);
  }

  getStats(): ActivityStats {
    return getStats(this.dataFile);
  }

  listProjects(): Project[] {
    return listProjects(this.dataFile);
  }

  getProjectById(projectId: number): Project | null {
    return getProjectById(this.dataFile, projectId);
  }

  getProjectByName(name: string): Project | null {
    return getProjectByName(this.dataFile, name);
  }

  createProject(name: string): Project {
    return createProject(this.dataFile, name);
  }

  renameProjectById(projectId: number, newName: string): Project | null {
    return renameProject(this.dataFile, projectId, newName);
  }

  deleteProject(projectId: number): { project: Project; orphanedItems: number } | null {
    return deleteProject(this.dataFile, projectId);
  }

  undoLastChange(): FlowData | null {
    return restoreUndoSnapshot(this.dataFile);
  }

  read(): FlowData {
    return readData(this.dataFile);
  }
}
