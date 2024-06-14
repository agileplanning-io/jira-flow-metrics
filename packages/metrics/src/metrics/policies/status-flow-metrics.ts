import { isNil, reverse, sumBy } from "remeda";
import {
  Issue,
  IssueFlowMetrics,
  StatusCategory,
  Transition,
} from "../../types";
import { getDifferenceInDays } from "@agileplanning-io/flow-lib";

export const getStatusFlowMetrics = (
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
