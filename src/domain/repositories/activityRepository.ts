import type {
  Activity,
  ActivityStats,
  AddActivityInput,
  FlowData,
  ListActivityOptions
} from "../activity.js";

export interface ActivityRepository {
  add(input: AddActivityInput): Activity;
  markDoneById(itemId: number | string): Activity | null;
  list(options?: ListActivityOptions): Activity[];
  getStats(): ActivityStats;
  read(): FlowData;
}
