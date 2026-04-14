import type {
  Activity,
  ActivityStats,
  AddActivityInput,
  FlowData,
  ListActivityOptions
} from "../../domain/activity.js";
import type { ActivityRepository } from "../../domain/repositories/activityRepository.js";
import { addItem, getStats, listItems, markItemDone, readData } from "../dataStore.js";

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

  list(options: ListActivityOptions = {}): Activity[] {
    return listItems(this.dataFile, options);
  }

  getStats(): ActivityStats {
    return getStats(this.dataFile);
  }

  read(): FlowData {
    return readData(this.dataFile);
  }
}
