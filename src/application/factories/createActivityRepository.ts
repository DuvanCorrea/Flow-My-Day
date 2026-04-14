import type { ActivityRepository } from "../../domain/repositories/activityRepository.js";
import { JsonActivityRepository } from "../../storage/adapters/jsonActivityRepository.js";

export function createActivityRepository(dataFile: string): ActivityRepository {
  return new JsonActivityRepository(dataFile);
}
