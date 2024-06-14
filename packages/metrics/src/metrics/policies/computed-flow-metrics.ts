import { map, pipe, sort } from "remeda";
import {
  Issue,
  IssueFlowMetrics,
  StatusCategory,
  isCompleted,
  isStarted,
} from "../../types";
import { compareAsc, compareDesc } from "date-fns";
import { getDifferenceInDays } from "@agileplanning-io/flow-lib";

export const getComputedFlowMetrics = (
  epic: Issue,
  issues: Issue[],
  now: Date,
): IssueFlowMetrics => {
  const children = issues.filter((child) => child.parentKey === epic.key);
  const startedChildren = children.filter(isStarted);
  const completedChildren = children.filter(isCompleted);

  const startedDates = pipe(
    startedChildren,
    map((issue) => issue.metrics.started),
    sort(compareAsc),
    map((x) => new Date(x)),
  );
  const started = startedDates[0];

  const completedDates = pipe(
    completedChildren,
    map((issue) => issue.metrics.completed),
    sort(compareDesc),
    map((x) => new Date(x)),
  );

  const completed =
    epic.statusCategory === StatusCategory.Done ? completedDates[0] : undefined;

  if (completed) {
    const cycleTime = started ? getDifferenceInDays(completed, started) : 0;
    return {
      started,
      completed,
      cycleTime,
    };
  }

  if (started) {
    const age = getDifferenceInDays(now, started);
    return {
      started,
      age,
    };
  }

  return {};
};
