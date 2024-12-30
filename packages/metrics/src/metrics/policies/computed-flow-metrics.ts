import { filter, flat, map, pipe, sort, sumBy } from "remeda";
import {
  filterIssues,
  FilterUseCase,
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
import {
  CycleTimePolicy,
  CycleTimePolicyType,
  EpicCycleTimePolicyType,
} from "./cycle-time-policy";

export const getComputedFlowMetrics = (
  epic: Issue,
  issues: Issue[],
  policy: CycleTimePolicy,
): IssueFlowMetrics => {
  const children = pipe(
    issues,
    filter(isChildOf(epic)),
    applyDerivedFilter(policy),
    filter(excludeToDoIssues(epic, policy)),
  );

  const getInProgressTransitions = (story: Issue) =>
    analyseTransitions(story.transitions, policy.type, policy.statuses)
      .inProgressTransitions;

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

  // Note: There are some inconsistencies in how we identify completed issues. An epic is completed
  // if the status category is done (below). But in getIssueStatus we infer the status based on
  // policy `statuses`. However, since derived cycle times are a simplifying tool, epic statuses
  // should be preferred if more control is desired over the definition of epic completion.
  const isCompleted = epic.statusCategory === StatusCategory.Done;

  const cycleTime =
    policy.type === CycleTimePolicyType.LeadTime
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

const applyDerivedFilter =
  (policy: CycleTimePolicy) =>
  (stories: Issue[]): Issue[] => {
    const filteredChildren =
      policy.epics.type === EpicCycleTimePolicyType.Derived
        ? filterIssues(stories, policy.epics, FilterUseCase.Metrics)
        : stories;

    const filteredChildrenKeys = new Set(
      filteredChildren.map((child) => child.key),
    );

    stories.forEach((story) => {
      if (!filteredChildrenKeys.has(story.key)) {
        story.metrics.includedInEpic = false;
      }
    });

    return filteredChildren;
  };

const isChildOf = (epic: Issue) => (child: Issue) =>
  child.parentKey === epic.key;

const excludeToDoIssues =
  (epic: Issue, policy: CycleTimePolicy) => (child: Issue) => {
    // ignore unstarted issues if the epic is done - e.g. leftover bugs, tech debt which are deemed unimportant
    if (
      epic.statusCategory === StatusCategory.Done &&
      getIssueStatus(child, policy) === StatusCategory.ToDo
    ) {
      return false;
    }

    // include all issues (including incomplete issues) in metrics when the epic is not done
    return true;
  };

const getIssueStatus = (
  issue: Issue,
  policy: CycleTimePolicy,
): StatusCategory => {
  const latestTransition = issue.transitions[issue.transitions.length - 1];
  if (policy.statuses.includes(latestTransition.toStatus.name)) {
    return StatusCategory.InProgress;
  }

  return latestTransition.toStatus.category;
};
