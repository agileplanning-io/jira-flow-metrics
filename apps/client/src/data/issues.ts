import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { intersection } from "rambda";
import { Interval } from "@jbrunton/flow-lib";
import {
  CompletedIssue,
  HierarchyLevel,
  Issue,
  IssueFlowMetrics,
  isCompleted,
} from "@jbrunton/flow-metrics";

const issuesQueryKey = "issues";

const getIssues = async (
  datasetId: string | undefined,
  includeWaitTime: boolean,
  fromStatus?: string,
  toStatus?: string,
): Promise<Issue[]> => {
  let url = `/datasets/${datasetId}/issues?includeWaitTime=${includeWaitTime}`;
  if (fromStatus && toStatus) {
    url += `&fromStatus=${fromStatus}&toStatus=${toStatus}`;
  }
  const response = await axios.get(url);
  return response.data.map((issue: Issue) => {
    const metrics: IssueFlowMetrics = {
      ...issue.metrics,
      started: parseDate(issue.metrics.started),
      completed: parseDate(issue.metrics.completed),
    };
    return {
      ...issue,
      metrics,
      created: parseDate(issue.created),
      transitions: issue.transitions
        ? issue.transitions.map((transition) => ({
            ...transition,
            date: new Date(transition.date),
            until: new Date(transition.until),
          }))
        : undefined,
    };
  });
};

const parseDate = (date: string | Date | undefined): Date | undefined => {
  return date ? new Date(date) : undefined;
};

export const useIssues = (
  datasetId: string | undefined,
  includeWaitTime: boolean,
  fromStatus?: string,
  toStatus?: string,
) => {
  return useQuery({
    queryKey: [
      issuesQueryKey,
      datasetId,
      includeWaitTime,
      fromStatus,
      toStatus,
    ],
    queryFn: () => getIssues(datasetId, includeWaitTime, fromStatus, toStatus),
    enabled: datasetId !== undefined && includeWaitTime !== undefined,
  });
};

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
      return intersects;
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

export type DatasetStatuses = {
  [HierarchyLevel.Story]: string[];
  [HierarchyLevel.Epic]: string[];
};

const getDatasetStatuses = async (
  datasetId?: string,
): Promise<DatasetStatuses> => {
  const response = await axios.get(`/datasets/${datasetId}/statuses`);
  return response.data;
};

export const useDatasetStatuses = (datasetId?: string) => {
  return useQuery({
    queryKey: [issuesQueryKey, datasetId],
    queryFn: () => getDatasetStatuses(datasetId),
    enabled: datasetId !== undefined,
  });
};