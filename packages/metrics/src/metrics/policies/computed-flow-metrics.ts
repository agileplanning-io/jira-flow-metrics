import { flat, map, pipe, sort, sumBy } from "remeda";
import {
  Issue,
  IssueFlowMetrics,
  StatusCategory,
  Transition,
} from "../../issues";
import { compareAsc, compareDesc } from "date-fns";
import {
  addDifferenceInDays,
  getDifferenceInDays,
  getSpanningSet,
} from "@agileplanning-io/flow-lib";
import { analyseTransitions } from "./status-flow-metrics";
import { CycleTimePolicy, CycleTimeType } from "./cycle-time-policy";

export const getComputedFlowMetrics = (
  epic: Issue,
  issues: Issue[],
  policy: CycleTimePolicy,
): IssueFlowMetrics => {
  const children = issues.filter((child) => child.parentKey === epic.key);

  const getInProgressTransitions = (story: Issue) =>
    analyseTransitions(story.transitions, policy.stories).inProgressTransitions;

  const convertToInterval = (transition: Transition) => ({
    start: transition.date,
    end: addDifferenceInDays(transition.date, transition.timeInStatus),
  });

  const intervals = pipe(
    children,
    map(getInProgressTransitions),
    flat(),
    map(convertToInterval),
  );

  const spanningSet = getSpanningSet(intervals);

  const startedDates = pipe(
    spanningSet,
    map((interval) => interval.start),
    sort(compareAsc),
    map((x) => new Date(x)),
  );
  const started = startedDates[0];

  const completedDates = pipe(
    spanningSet,
    map((interval) => interval.end),
    sort(compareDesc),
    map((x) => new Date(x)),
  );

  const completed = completedDates[0];
  const isCompleted = epic.statusCategory === StatusCategory.Done;

  const cycleTime =
    policy.epics.cycleTimeType === CycleTimeType.TotalLeadTime
      ? getDifferenceInDays(completed, started)
      : sumBy(spanningSet, (interval) =>
          getDifferenceInDays(interval.end, interval.start),
        );

  if (isCompleted) {
    return {
      started,
      completed,
      cycleTime,
    };
  }

  if (started) {
    return {
      started,
      age: cycleTime,
    };
  }

  return {};
};
