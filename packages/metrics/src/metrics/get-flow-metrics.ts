import { isNil, map, pipe, reverse, sort, sumBy } from "remeda";
import {
  CycleTimePolicy,
  HierarchyLevel,
  Issue,
  IssueFlowMetrics,
  StatusCategory,
  Transition,
  isCompleted,
  isStarted,
} from "../types";
import { compareAsc, compareDesc } from "date-fns";
import { getDifferenceInDays } from "@agileplanning-io/flow-lib";
import { filterIssues } from "../util";

export const getFlowMetrics = (
  issues: Issue[],
  policy: CycleTimePolicy,
  now: Date = new Date(),
): Issue[] => {
  const { includeWaitTime, statuses } = policy.stories;

  const stories = issues.filter(
    (issue) => issue.hierarchyLevel === HierarchyLevel.Story,
  );

  const epics = issues.filter(
    (issue) => issue.hierarchyLevel === HierarchyLevel.Epic,
  );

  const updatedStories = stories.map((story) => {
    const metrics = getStatusFlowMetrics(story, includeWaitTime, statuses);
    return {
      ...story,
      metrics,
    };
  });

  const filteredStories =
    policy.epics.type === "computed"
      ? filterIssues(updatedStories, {
          labels: policy.epics.labelsFilter?.labels,
          labelFilterType: policy.epics.labelsFilter?.labelFilterType,
        })
      : updatedStories;

  const epicKeys = new Set(epics.map((epic) => epic.key));
  const includedStoryKeys = new Set(
    filteredStories
      .filter((story) => story.parentKey && epicKeys.has(story.parentKey))
      .map((story) => story.key),
  );

  updatedStories.forEach((story) => {
    if (includedStoryKeys.has(story.key)) {
      story.metrics.includedInEpic = true;
    }
  });

  const updatedEpics = epics.map((epic) => {
    const metrics =
      policy.epics.type === "computed"
        ? getComputedFlowMetrics(epic, filteredStories, now)
        : getStatusFlowMetrics(
            epic,
            policy.epics.includeWaitTime,
            policy.epics.statuses,
          );
    return {
      ...epic,
      metrics,
    };
  });

  return [...updatedEpics, ...updatedStories];
};

const getStartedDateIndex = (
  transitions: Array<Transition>,
  statuses?: string[],
): number => {
  return transitions.findIndex((transition) =>
    isNil(statuses)
      ? transition.toStatus.category === StatusCategory.InProgress
      : statuses.includes(transition.toStatus.name),
  );
};

const getCompletedDateIndex = (
  transitions: Array<Transition>,
  statuses?: string[],
): number => {
  const isDoneTransition = (transition: Transition) => {
    if (isNil(statuses)) {
      return transition.toStatus.category === StatusCategory.Done;
    } else {
      return (
        // A user may be interested in time to a specific done transition (e.g. "Dev Complete", "Released").
        // In this case, "Dev Complete" may have a category of Done but be in "statuses".
        !statuses.includes(transition.toStatus.name) &&
        transition.toStatus.category === StatusCategory.Done
      );
    }
  };

  const isCompletedTransition = (transition: Transition) => {
    if (!isDoneTransition(transition)) {
      return false;
    }
    if (isNil(statuses)) {
      return transition.fromStatus.category !== StatusCategory.Done;
    }
    return (
      // This OR expression is to deal with reopened issues. If an issue moved from a To Do
      // status to Done then `statuses.includes(transition.fromStatus.name)` will return false.
      statuses.includes(transition.fromStatus.name) ||
      transition.fromStatus.category !== StatusCategory.Done
    );
  };

  if (!isDoneTransition(transitions[transitions.length - 1])) {
    return -1;
  }

  const index = reverse(transitions).findIndex(isCompletedTransition);

  return index === -1 ? -1 : transitions.length - index - 1;
};

const getStatusFlowMetrics = (
  story: Issue,
  includeWaitTime: boolean,
  statuses?: string[],
): IssueFlowMetrics => {
  const now = new Date();
  const startedIndex = getStartedDateIndex(story.transitions, statuses);
  const completedIndex = getCompletedDateIndex(story.transitions, statuses);

  if (startedIndex === -1 && completedIndex === -1) {
    return {};
  }

  if (startedIndex === -1) {
    // moved straight to done
    return {
      completed: story.transitions[completedIndex].date,
      cycleTime: 0,
    };
  }

  const getCycleTime = (transitions: Transition[]) => {
    return sumBy(transitions.slice(0, transitions.length - 1), (transition) => {
      if (includeWaitTime) {
        return transition.timeInStatus;
      } else {
        if (statuses) {
          return statuses.includes(transition.toStatus.name)
            ? transition.timeInStatus
            : 0;
        } else {
          return transition.toStatus.category === StatusCategory.InProgress
            ? transition.timeInStatus
            : 0;
        }
      }
    });
  };

  if (completedIndex === -1) {
    // started but not yet completed
    const lastTransition = story.transitions[story.transitions.length - 1];
    const timeInLastTransition =
      lastTransition.toStatus.category === StatusCategory.InProgress ||
      includeWaitTime
        ? getDifferenceInDays(now, lastTransition.date)
        : 0;
    const age =
      timeInLastTransition +
      getCycleTime(story.transitions.slice(startedIndex));
    return {
      started: story.transitions[startedIndex].date,
      age,
    };
  }

  const transitions = story.transitions.slice(startedIndex, completedIndex + 1);
  const cycleTime = getCycleTime(transitions);

  const started = transitions[0].date;
  const completed = transitions[transitions.length - 1].date;

  return {
    started,
    completed,
    cycleTime,
  };
};

const getComputedFlowMetrics = (
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
