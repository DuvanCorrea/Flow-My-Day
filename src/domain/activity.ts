export const ACTIVITY_TYPES = ["done", "later", "debt"] as const;
export const ACTIVITY_STATUSES = ["open", "done"] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export interface Activity {
  id: number;
  type: ActivityType;
  text: string;
  status: ActivityStatus;
  createdAt: string;
  doneAt: string | null;
}

export interface FlowDataMeta {
  version: number;
  createdAt: string;
  updatedAt: string;
  nextId: number;
}

export interface FlowData {
  meta: FlowDataMeta;
  items: Activity[];
}

export interface AddActivityInput {
  type: ActivityType;
  text: string;
  status: ActivityStatus;
}

export interface ListActivityOptions {
  type?: ActivityType | "all" | string;
  status?: ActivityStatus | "all" | string;
  limit?: number;
}

export interface ActivityStats {
  total: number;
  done: number;
  open: number;
  byType: {
    done: number;
    later: number;
    debt: number;
  };
}
