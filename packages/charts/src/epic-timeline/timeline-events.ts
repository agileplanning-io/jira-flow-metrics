import { Issue, Transition } from "@agileplanning-io/flow-metrics";
import { addHours } from "date-fns";
import { equals, dropWhile, flatten } from "remeda";

export type TimelineEvent = {
  label: string;
  summary: string;
  issueKey: string;
  status: string;
  category: Issue["statusCategory"];
  start: Date;
  end: Date;
  startTime: number;
  endTime: number;
  isCompletedStatus: boolean;
};

export const getTimelineEvents = (
  epic: Issue,
  issues: Issue[],
): TimelineEvent[] => {
  const completedDate = epic.metrics?.completed;
  const now = new Date();
  const truncateBy = epic.metrics.cycleTime
    ? (epic.metrics.cycleTime / 20) * 24
    : 0;
  const truncateDate =
    completedDate && addHours(completedDate, truncateBy) < now
      ? addHours(completedDate, truncateBy)
      : undefined;

  const dropDoneStatuses = (
    transitions: Transition[],
    transition: Transition,
  ) => {
    // incomplete epic, don't drop any statuses
    if (!truncateDate) {
      return [...transitions, transition];
    }

    // status is before completed date, keep it
    if (transition.until < truncateDate) {
      return [...transitions, transition];
    }

    // status begins after it was completed, discard it
    if (transition.date > truncateDate) {
      return transitions;
    }

    // status spans the completed date, truncate it
    return [
      ...transitions,
      {
        ...transition,
        until: truncateDate,
      },
    ];
  };

  const mergeStatuses = (
    transitions: Transition[],
    transition: Transition,
    index: number,
  ) => {
    const prevTransition = index > 0 ? transitions[index - 1] : undefined;
    if (
      prevTransition &&
      equals(prevTransition.toStatus, transition.toStatus)
    ) {
      // merge adjacent transitions to the same status
      prevTransition.until = transition.until;
      return transitions;
    } else {
      return [...transitions, transition];
    }
  };

  const events = issues.map((issue) => {
    const transitions = dropWhile(
      issue.transitions,
      (t) => t.toStatus.category === "To Do",
    )
      .reduce<Transition[]>(mergeStatuses, [])
      .reduce<Transition[]>(dropDoneStatuses, []);

    const events = transitions.map((t, index) => {
      const prevTransition = index > 0 ? transitions[index - 1] : undefined;
      const startTime = prevTransition ? 0 : t.date.getTime();
      const endTime = prevTransition
        ? t.until.getTime() - t.date.getTime()
        : t.until.getTime();
      return {
        issueKey: issue.key,
        summary: issue.summary,
        start: t.date,
        end: t.until,
        startTime,
        endTime,
        status: t.toStatus.name,
        category: t.toStatus.category,
        isCompletedStatus:
          (issue.metrics.completed && index === transitions.length - 1) ??
          false,
        label: "", // TODO: when should this be computed?
      };
    });

    return events;
  });

  return flatten(events);
};
