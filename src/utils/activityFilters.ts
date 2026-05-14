import dayjs from "dayjs";
import type { Activity, ActivityStats, Project } from "../domain/activity.js";

export interface ActivityFilterOptions {
  project?: string;
  today?: boolean;
  week?: boolean;
  month?: boolean;
  date?: string;
  from?: string;
  to?: string;
}

interface DateRange {
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
}

export interface ResolvedActivityFilters {
  projectId: number | null;
  dateRange: DateRange | null;
}

export type ResolveActivityFiltersResult =
  | { kind: "ok"; filters: ResolvedActivityFilters }
  | { kind: "project-not-found"; reference: string }
  | { kind: "invalid-date"; value: string }
  | { kind: "date-filter-conflict" }
  | { kind: "invalid-date-range"; from: string; to: string };

function parseExactDate(value: string): dayjs.Dayjs | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = dayjs(value);
  if (!parsed.isValid() || parsed.format("YYYY-MM-DD") !== value) {
    return null;
  }

  return parsed;
}

function resolveProjectFilterId(projectReference: string, projects: Project[]): number | null {
  const normalized = projectReference.trim();
  if (!normalized) {
    return null;
  }

  if (/^[+-]?\d+$/.test(normalized)) {
    const id = Number(normalized);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return null;
    }

    return projects.some((project) => project.id === id) ? id : null;
  }

  const search = normalized.toLocaleLowerCase();
  const match = projects.find((project) => project.name.toLocaleLowerCase() === search);
  return match ? match.id : null;
}

export function resolveActivityFilters(
  options: ActivityFilterOptions,
  projects: Project[]
): ResolveActivityFiltersResult {
  let projectId: number | null = null;

  if (options.project) {
    projectId = resolveProjectFilterId(options.project, projects);
    if (projectId === null) {
      return { kind: "project-not-found", reference: options.project };
    }
  }

  const activePresetCount = [
    options.today,
    options.week,
    options.month,
    Boolean(options.date)
  ].filter(Boolean).length;
  const hasRange = Boolean(options.from || options.to);

  if (activePresetCount > 1 || (activePresetCount > 0 && hasRange)) {
    return { kind: "date-filter-conflict" };
  }

  let dateRange: DateRange | null = null;
  const now = dayjs();

  if (options.today) {
    dateRange = {
      start: now.startOf("day"),
      end: now.endOf("day")
    };
  } else if (options.week) {
    dateRange = {
      start: now.subtract(6, "day").startOf("day"),
      end: now.endOf("day")
    };
  } else if (options.month) {
    dateRange = {
      start: now.startOf("month"),
      end: now.endOf("month")
    };
  } else if (options.date) {
    const exactDate = parseExactDate(options.date);
    if (!exactDate) {
      return { kind: "invalid-date", value: options.date };
    }

    dateRange = {
      start: exactDate.startOf("day"),
      end: exactDate.endOf("day")
    };
  } else if (options.from || options.to) {
    let start = dayjs("1970-01-01");
    let end = dayjs("9999-12-31");

    if (options.from) {
      const parsedFrom = parseExactDate(options.from);
      if (!parsedFrom) {
        return { kind: "invalid-date", value: options.from };
      }
      start = parsedFrom.startOf("day");
    }

    if (options.to) {
      const parsedTo = parseExactDate(options.to);
      if (!parsedTo) {
        return { kind: "invalid-date", value: options.to };
      }
      end = parsedTo.endOf("day");
    }

    if (start.isAfter(end)) {
      return {
        kind: "invalid-date-range",
        from: options.from || "1970-01-01",
        to: options.to || "9999-12-31"
      };
    }

    dateRange = { start, end };
  }

  return {
    kind: "ok",
    filters: {
      projectId,
      dateRange
    }
  };
}

export function applyActivityFilters(items: Activity[], filters: ResolvedActivityFilters): Activity[] {
  const byProject = filters.projectId === null
    ? items
    : items.filter((item) => item.projectId === filters.projectId);

  if (!filters.dateRange) {
    return byProject;
  }

  return byProject.filter((item) => {
    const createdAt = dayjs(item.createdAt);
    if (!createdAt.isValid()) {
      return false;
    }

    return (createdAt.isAfter(filters.dateRange.start) || createdAt.isSame(filters.dateRange.start))
      && (createdAt.isBefore(filters.dateRange.end) || createdAt.isSame(filters.dateRange.end));
  });
}

export function buildStatsFromItems(items: Activity[]): ActivityStats {
  const stats: ActivityStats = {
    total: items.length,
    done: 0,
    open: 0,
    byType: {
      done: 0,
      later: 0,
      debt: 0
    }
  };

  for (const item of items) {
    if (item.status === "done") {
      stats.done += 1;
    } else {
      stats.open += 1;
    }

    if (item.type === "done" || item.type === "later" || item.type === "debt") {
      stats.byType[item.type] += 1;
    }
  }

  return stats;
}
