import type {
  Activity,
  ActivityStats,
  AddActivityInput,
  FlowData,
  ListActivityOptions,
  Project
} from "../activity.js";

export interface ActivityRepository {
  add(input: AddActivityInput): Activity;
  markDoneById(itemId: number | string): Activity | null;
  updateTextById(itemId: number | string, newText: string): Activity | null;
  deleteById(itemId: number | string): Activity | null;
  list(options?: ListActivityOptions): Activity[];
  getStats(): ActivityStats;
  listProjects(): Project[];
  getProjectById(projectId: number): Project | null;
  getProjectByName(name: string): Project | null;
  createProject(name: string): Project;
  renameProjectById(projectId: number, newName: string): Project | null;
  deleteProject(projectId: number): { project: Project; orphanedItems: number } | null;
  undoLastChange(): FlowData | null;
  read(): FlowData;
}
