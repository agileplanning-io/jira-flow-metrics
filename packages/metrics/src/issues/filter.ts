import { intersection, isDeepEqual, isNonNullish, isNullish } from "remeda";
import { CompletedIssue, HierarchyLevel, Issue, isCompleted } from "./issues";
import {
  AbsoluteInterval,
  Interval,
  asAbsolute,
  intervalContainsDate,
} from "@agileplanning-io/flow-lib";

export enum DateFilterType {
  Completed = "completed",
  Overlaps = "overlaps",
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

/**
 * The filtering use case.
 */
export enum FilterUseCase {
  /**
   * When simply listing issues, we should apply all filter criteria as specified.
   */
  List = "list",

  /**
   * When applying filters for metrics, we should only apply the resolution filter if there is a
   * resolution. Otherwise we omit started issues from the cycle time/age.
   */
  Metrics = "metrics",
}

export const filterIssues = (
  issues: Issue[],
  filter: IssueFilter,
  useCase: FilterUseCase = FilterUseCase.List,
): Issue[] => {
  return issues.filter((issue) => {
    if (filter.hierarchyLevel) {
      if (issue.hierarchyLevel !== filter.hierarchyLevel) {
        return false;
      }
    }

    const shouldApplyResolutionFilter =
      (useCase === FilterUseCase.Metrics && isNonNullish(issue.resolution)) ||
      useCase === FilterUseCase.List;
    if (
      shouldApplyResolutionFilter &&
      !matchValuesFilter(filter.resolutions, issue.resolution)
    ) {
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
      const interval = asAbsolute(filter.dates.interval);

      if (filter.dates.filterType === DateFilterType.Completed) {
        if (!completedInInterval(issue, interval)) {
          return false;
        }
      } else if (!overlapsInterval(issue, interval)) {
        return false;
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

const isValuesFilterEqual = (
  filter1: ValuesFilter | undefined,
  filter2: ValuesFilter | undefined,
) => {
  const isNullFilter = (filter: ValuesFilter | undefined) => {
    if (isNullish(filter)) {
      return true;
    }

    if (isNullish(filter.values) || filter.values.length === 0) {
      return true;
    }

    return false;
  };

  if (isNullFilter(filter1) && isNullFilter(filter2)) {
    return true;
  }

  return isDeepEqual(filter1, filter2);
};

export const isAttributesFilterEqual = (
  filter1: IssueAttributesFilter,
  filter2: IssueAttributesFilter,
) => {
  const fields: (keyof IssueAttributesFilter)[] = [
    "assignees",
    "components",
    "issueTypes",
    "labels",
    "resolutions",
    "statuses",
  ];

  return fields.every((field) =>
    isValuesFilterEqual(filter1[field], filter2[field]),
  );
};

const completedInInterval = (issue: Issue, interval: AbsoluteInterval) => {
  if (!issue.metrics.completed) {
    return false;
  }

  return intervalContainsDate(interval, issue.metrics.completed);
};

const overlapsInterval = (issue: Issue, interval: AbsoluteInterval) => {
  if (!issue.metrics.started) {
    return false;
  }

  if (issue.metrics.started > interval.end) {
    return false;
  }

  if (issue.metrics.completed && issue.metrics.completed < interval.start) {
    return false;
  }

  return true;
};
