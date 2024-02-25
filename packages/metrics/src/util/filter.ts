import { intersection } from "remeda";
import { CompletedIssue, HierarchyLevel, Issue, isCompleted } from "../types";
import { Interval } from "@agileplanning-io/flow-lib";

export enum DateFilterType {
  Completed,
  Intersects,
}

export enum LabelFilterType {
  Include = "include",
  Exclude = "exclude",
}

export type IssueFilter = {
  hierarchyLevel?: HierarchyLevel;
  resolutions?: string[];
  statuses?: string[];
  fromStatus?: string;
  toStatus?: string;
  issueTypes?: string[];
  assignees?: string[];
  labels?: string[];
  components?: string[];
  labelFilterType?: LabelFilterType;
  dates?: Interval;
  dateFilterType?: DateFilterType;
};

export const filterIssues = (issues: Issue[], filter: IssueFilter): Issue[] => {
  return issues.filter((issue) => {
    if (filter.hierarchyLevel) {
      if (issue.hierarchyLevel !== filter.hierarchyLevel) {
        return false;
      }
    }

    if (filter.resolutions && filter.resolutions.length > 0) {
      if (!issue.resolution || !filter.resolutions.includes(issue.resolution)) {
        return false;
      }
    }

    if (filter.issueTypes && filter.issueTypes.length > 0) {
      if (!issue.issueType || !filter.issueTypes.includes(issue.issueType)) {
        return false;
      }
    }

    if (filter.assignees && filter.assignees.length > 0) {
      if (!issue.assignee || !filter.assignees.includes(issue.assignee)) {
        return false;
      }
    }

    if (filter.labels && filter.labels.length > 0) {
      const intersects = intersection(filter.labels, issue.labels).length > 0;
      if (filter.labelFilterType === "include" && !intersects) {
        return false;
      } else if (filter.labelFilterType === "exclude" && intersects) {
        return false;
      }
    }

    if (filter.components && filter.components.length > 0) {
      const intersects =
        intersection(filter.components, issue.components).length > 0;
      if (!intersects) {
        return false;
      }
    }

    if (filter.statuses && filter.statuses.length > 0) {
      if (!filter.statuses.includes(issue.status)) {
        return false;
      }
    }

    if (filter.dates) {
      if (
        filter.dateFilterType === undefined ||
        filter.dateFilterType === DateFilterType.Completed
      ) {
        if (!issue.metrics.completed) {
          return false;
        }

        if (issue.metrics.completed < filter.dates.start) {
          return false;
        }

        if (issue.metrics.completed > filter.dates.end) {
          return false;
        }
      } else {
        if (!issue.metrics.started) {
          return false;
        }

        if (issue.metrics.started > filter.dates.end) {
          return false;
        }

        if (
          issue.metrics.completed &&
          issue.metrics.completed < filter.dates.start
        ) {
          return false;
        }

        return true;
      }
    }

    return true;
  });
};

export const filterCompletedIssues = (
  issues: Issue[],
  filter: IssueFilter,
): CompletedIssue[] => {
  return filterIssues(issues, filter).filter(isCompleted);
};
