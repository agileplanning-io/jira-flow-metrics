import { isNil, reverse, sumBy } from "remeda";
import {
  Issue,
  IssueFlowMetrics,
  StatusCategory,
  Transition,
} from "../../issues";
import { TransitionCycleTimePolicy } from "./cycle-time-policy";

type TransitionAnalysis = {
  inProgressTransitions: Transition[];
  startedIndex: number;
  completedIndex: number;
};

export const analyseTransitions = (
  transitions: Transition[],
  policy: TransitionCycleTimePolicy,
): TransitionAnalysis => {
  const startedIndex = getStartedDateIndex(transitions, policy.statuses);
  const completedIndex = getCompletedDateIndex(transitions, policy.statuses);

  const isStarted = startedIndex >= 0;
  const isCompleted = completedIndex >= 0;

  const isInProgress = (transition: Transition, index: number) => {
    if (policy.includeWaitTime) {
      return isCompleted ? index < completedIndex : true;
    } else {
      if (policy.statuses) {
        return policy.statuses.includes(transition.toStatus.name);
      } else {
        return transition.toStatus.category === StatusCategory.InProgress;
      }
    }
  };

  const inProgressTransitions = isStarted
    ? transitions.filter(isInProgress)
    : [];

  return {
    startedIndex,
    completedIndex,
    inProgressTransitions,
  };
};

export const getStatusFlowMetrics = (
  story: Issue,
  policy: TransitionCycleTimePolicy,
): IssueFlowMetrics => {
  const { startedIndex, completedIndex, inProgressTransitions } =
    analyseTransitions(story.transitions, policy);

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

  const cycleTime = sumBy(
    inProgressTransitions,
    (transition) => transition.timeInStatus,
  );

  if (completedIndex === -1) {
    return {
      started: story.transitions[startedIndex].date,
      age: cycleTime,
    };
  }

  const started = story.transitions[startedIndex].date;
  const completed = story.transitions[completedIndex].date;

  return {
    started,
    completed,
    cycleTime,
  };
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
