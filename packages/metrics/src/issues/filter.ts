import { intersection } from "remeda";
import { CompletedIssue, HierarchyLevel, Issue, isCompleted } from "../issues";
import { Interval } from "@agileplanning-io/flow-lib";

export enum DateFilterType {
  Completed,
  Intersects,
}

export enum FilterType {
  Include = "include",
  Exclude = "exclude",
}

export type ValuesFilter = {
  values?: string[];
  type?: FilterType;
};

export const defaultValuesFilter = (): ValuesFilter => ({
  values: [],
  type: FilterType.Include,
});

export type DatesFilter = {
  interval: Interval;
  filterType: DateFilterType;
};

export type IssueAttributesFilter = {
  resolutions?: ValuesFilter;
  statuses?: ValuesFilter;
  issueTypes?: ValuesFilter;
  assignees?: ValuesFilter;
  labels?: ValuesFilter;
  components?: ValuesFilter;
};

export type IssueFilter = IssueAttributesFilter & {
  hierarchyLevel?: HierarchyLevel;
  dates?: DatesFilter;
};

const matchValuesFilter = (
  filter?: ValuesFilter,
  value?: string | string[],
): boolean => {
  if (filter?.values && filter.values.length > 0) {
    const matches =
      value &&
      (Array.isArray(value)
        ? intersection(filter.values, value).length > 0
        : filter.values.includes(value));
    if (filter.type === FilterType.Include && !matches) {
      return false;
    } else if (filter.type === FilterType.Exclude && matches) {
      return false;
    }
  }
  return true;
};

export const filterIssues = (issues: Issue[], filter: IssueFilter): Issue[] => {
  return issues.filter((issue) => {
    if (filter.hierarchyLevel) {
      if (issue.hierarchyLevel !== filter.hierarchyLevel) {
        return false;
      }
    }

    if (!matchValuesFilter(filter.resolutions, issue.resolution)) {
      return false;
    }

    if (!matchValuesFilter(filter.issueTypes, issue.issueType)) {
      return false;
    }

    if (!matchValuesFilter(filter.assignees, issue.assignee)) {
      return false;
    }

    if (!matchValuesFilter(filter.labels, issue.labels)) {
      return false;
    }

    if (!matchValuesFilter(filter.components, issue.components)) {
      return false;
    }

    if (!matchValuesFilter(filter.statuses, issue.status)) {
      return false;
    }

    if (filter.dates) {
      if (filter.dates.filterType === DateFilterType.Completed) {
        if (!issue.metrics.completed) {
          return false;
        }

        if (issue.metrics.completed < filter.dates.interval.start) {
          return false;
        }

        if (issue.metrics.completed > filter.dates.interval.end) {
          return false;
        }
      } else {
        if (!issue.metrics.started) {
          return false;
        }

        if (issue.metrics.started > filter.dates.interval.end) {
          return false;
        }

        if (
          issue.metrics.completed &&
          issue.metrics.completed < filter.dates.interval.start
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
