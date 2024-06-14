import { compact, identity, pipe, reject, sortBy, sumBy } from "remeda";
import { Interval, getIntersectingInterval } from "@agileplanning-io/flow-lib";
import { differenceInSeconds } from "date-fns";
import { HierarchyLevel, Issue } from "../issues";

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
        const overlaps = compact(
          issue.transitions.map((transition) =>
            transition.toStatus.category === "In Progress"
              ? getIntersectingInterval(period, {
                  start: transition.date,
                  end: transition.until,
                })
              : undefined,
          ),
        );
        const timeInPeriod = sumBy(
          overlaps,
          (interval) =>
            differenceInSeconds(interval.end, interval.start) / secondsInDay,
        );
        return [issue.key, timeInPeriod];
      }),
  );

  const epics = issues.filter(
    (issue) => issue.hierarchyLevel === HierarchyLevel.Epic,
  );

  const totalTime = sumBy(Object.values(timesInPeriod), identity);

  const aggregateChildren = ({
    summary,
    key,
    rowType,
    children,
  }: Pick<Required<TimeSpentRow>, "summary" | "key" | "rowType" | "children"> &
    Pick<TimeSpentRow, "externalUrl">): TimeSpentRow => {
    const filteredChildren = pipe(
      children,
      sortBy<TimeSpentRow>((child) => -(child.percentInPeriod ?? 0)),
      reject<TimeSpentRow>((child) => !child.timeInPeriod),
    );
    return {
      summary,
      key,
      rowType,
      timeInPeriod: sumBy(
        compact(filteredChildren),
        (child) => child.timeInPeriod ?? 0,
      ),
      percentInPeriod: sumBy(
        compact(filteredChildren),
        (child) => child.percentInPeriod ?? 0,
      ),
      issueCount: sumBy(
        filteredChildren,
        (child) => child.children?.length ?? 1,
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
