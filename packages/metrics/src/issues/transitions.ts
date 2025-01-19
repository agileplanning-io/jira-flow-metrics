import { getDifferenceInDays } from "@agileplanning-io/flow-lib";
import { compareAsc } from "date-fns";
import { StatusCategory, Transition } from "./issues";

export type TransitionContext = Omit<Transition, "timeInStatus" | "until">;

export const buildTransitions = (
  transitions: TransitionContext[],
  created: Date,
  status: string,
  statusCategory: StatusCategory,
  now: Date = new Date(),
): Transition[] => {
  const sortedTransitions = transitions.sort((t1, t2) =>
    compareAsc(t1.date, t2.date),
  );

  const createdTransition: TransitionContext =
    sortedTransitions.length > 0
      ? {
          fromStatus: {
            name: "Created",
            category: StatusCategory.ToDo,
          },
          date: created,
          toStatus: sortedTransitions[0].fromStatus,
        }
      : {
          fromStatus: {
            name: "Created",
            category: StatusCategory.ToDo,
          },
          date: created,
          toStatus: {
            name: status,
            category: statusCategory,
          },
        };

  return [createdTransition, ...sortedTransitions].map(
    (transition, index, transitions): Transition => {
      const nextTransitionDate =
        index < transitions.length - 1 ? transitions[index + 1].date : now;
      const timeInStatus = getDifferenceInDays(
        nextTransitionDate,
        transition.date,
      );
      return {
        ...transition,
        timeInStatus,
        until: nextTransitionDate,
      };
    },
  );
};
