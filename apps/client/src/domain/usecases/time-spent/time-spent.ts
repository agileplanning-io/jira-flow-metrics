import { isNil, pipe, reject, sortBy, sum } from "rambda";
import { HierarchyLevel, Issue } from "@agileplanning-io/flow-metrics";
import { Interval, getIntersectingInterval } from "@agileplanning-io/flow-lib";
import { differenceInSeconds } from "date-fns";

export type TimeSpentRow = Pick<Issue, "key" | "summary"> &
  Partial<
    Pick<
      Issue,
      "externalUrl" | "resolution" | "status" | "statusCategory" | "issueType"
    >
  > & {
    timeInPeriod?: number;
    percentInPeriod?: number;
    issueCount?: number;
    children?: TimeSpentRow[];
    rowType: "story" | "epic" | "category";
  };

const secondsInDay = 60 * 60 * 24;

export const timeSpentInPeriod = (
  issues: Issue[],
  period: Interval,
): TimeSpentRow[] => {
  const timesInPeriod = Object.fromEntries(
    issues
      .filter((issue) => issue.hierarchyLevel === HierarchyLevel.Story)
      .map((issue) => {
        if (!issue.metrics.includedInEpic) {
          return [issue.key, 0];
        }
        const overlaps = reject(isNil)(
          issue.transitions.map((transition) =>
            transition.toStatus.category === "In Progress"
              ? getIntersectingInterval(period, {
                  start: transition.date,
                  end: transition.until,
                })
              : undefined,
          ),
        );
        const timeInPeriod = sum(
          overlaps.map(
            (interval) =>
              differenceInSeconds(interval.end, interval.start) / secondsInDay,
          ),
        );
        return [issue.key, timeInPeriod];
      }),
  );

  const epics = issues.filter(
    (issue) => issue.hierarchyLevel === HierarchyLevel.Epic,
  );

  const totalTime = sum(Object.values(timesInPeriod));

  const aggregateChildren = ({
    summary,
    key,
    rowType,
    children,
  }: Pick<Required<TimeSpentRow>, "summary" | "key" | "rowType" | "children"> &
    Pick<TimeSpentRow, "externalUrl">): TimeSpentRow => {
    const filteredChildren = pipe(
      sortBy<TimeSpentRow>((child) => -(child.percentInPeriod ?? 0)),
      reject<TimeSpentRow>((child) => !child.timeInPeriod),
    )(children);
    return {
      summary,
      key,
      rowType,
      timeInPeriod: sum(
        reject(isNil)(filteredChildren.map((child) => child.timeInPeriod)),
      ),
      percentInPeriod: sum(
        reject(isNil)(filteredChildren.map((child) => child.percentInPeriod)),
      ),
      issueCount: sum(
        filteredChildren.map((child) => child.children?.length ?? 1),
      ),
      children: filteredChildren,
    };
  };

  const epicData: TimeSpentRow[] = epics.map((epic) => {
    const children: TimeSpentRow[] = issues
      .filter((issue) => issue.parentKey === epic.key)
      .map((issue) => {
        const timeInPeriod = timesInPeriod[issue.key];
        const percentInPeriod = (timeInPeriod / totalTime) * 100;

        return {
          ...issue,
          rowType: "story",
          timeInPeriod,
          percentInPeriod,
        };
      });

    return {
      ...epic,
      ...aggregateChildren({
        summary: epic.summary,
        key: epic.key,
        children,
        rowType: "epic",
      }),
    };
  });

  const unassignedData: TimeSpentRow[] = issues
    .filter(
      (issue) =>
        issue.hierarchyLevel === HierarchyLevel.Story && !issue.parentKey,
    )
    .map((issue) => {
      const timeInPeriod = timesInPeriod[issue.key];
      const percentInPeriod = (timeInPeriod / totalTime) * 100;

      return {
        ...issue,
        rowType: "story",
        timeInPeriod,
        percentInPeriod,
      };
    });

  const result = [
    aggregateChildren({
      summary: "Epics",
      key: "epics",
      rowType: "category",
      children: epicData,
    }),
    aggregateChildren({
      summary: "Issues without epics",
      key: "unassigned",
      rowType: "category",
      children: unassignedData,
    }),
  ];

  return result;
};
