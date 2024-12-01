import { range } from "remeda";
import { addDays, differenceInDays } from "date-fns";
import { AbsoluteInterval } from "@agileplanning-io/flow-lib";
import { isStarted, Issue, StartedIssue, StatusCategory } from "../issues";

/**
 * The WIP algorithm type.
 */
export enum WipType {
  /**
   * Count based on started and completed times. An issue is considered in progress until it is
   * completed, even if it is paused.
   */
  LeadTime = "leadTime",

  /**
   * Count based on status changes. An issue is no longer considered in progress when it is paused.
   */
  Status = "status",
}

export type CalculateWipParams = {
  issues: Issue[];
  range: AbsoluteInterval;
  wipType: WipType;
  /**
   * When true, counts all issues started before a given date, even if they were paused a long time
   * before.
   *
   * When false, excludes issues stopped prior to the given date range. It will, however, count
   * issues started within the range and then stopped as in progress from their start date.
   */
  includeStoppedIssues: boolean;
};

export type WipResult = {
  date: Date;
  count: number;
  issues: Issue[];
}[];

export const calculateWip = ({
  issues,
  range: dateRange,
  includeStoppedIssues,
  wipType,
}: CalculateWipParams): WipResult => {
  if (!dateRange) {
    return [];
  }

  const getStoppedDate = (issue: Issue) => {
    return issue.transitions
      .reverse()
      .find(
        (transition) =>
          transition.toStatus.category === StatusCategory.ToDo &&
          transition.fromStatus.category !== StatusCategory.ToDo,
      )?.until;
  };

  const startedIssues = issues.filter(isStarted).filter((issue) => {
    if (includeStoppedIssues) {
      return true;
    }

    const stoppedDate = getStoppedDate(issue);

    if (stoppedDate && stoppedDate < dateRange.start) {
      return false;
    }

    return true;
  });

  const dates = range(0, differenceInDays(dateRange.end, dateRange.start)).map(
    (index) => addDays(dateRange.start, index),
  );

  const wipFilter =
    wipType === WipType.LeadTime ? filterByLeadTime : filterByStatus;

  const result: WipResult = dates.map((date) => {
    const inProgress = startedIssues.filter(wipFilter(date));
    const count = inProgress.length;
    return {
      date,
      count,
      issues: inProgress,
    };
  });

  return result;
};

const filterByLeadTime = (date: Date) => (issue: StartedIssue) =>
  issue.metrics.started < date &&
  (!issue.metrics.completed || issue.metrics.completed > date);

const filterByStatus = (date: Date) => (issue: StartedIssue) =>
  issue.transitions.some((transition) => {
    const inProgress =
      transition.toStatus.category === StatusCategory.InProgress &&
      transition.date < date &&
      transition.until > date;
    if (issue.key === "CORE-491" && inProgress) {
      console.log(date, transition);
    }
    return inProgress;
  });
