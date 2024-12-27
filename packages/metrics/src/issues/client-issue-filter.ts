import { Interval } from "@agileplanning-io/flow-lib";
import { omit } from "remeda";
import { DateFilterType, defaultValuesFilter, IssueFilter } from "./filter";

/**
 * A client app page typically has an obvious filter type, so the type doesn't need to be speified
 * in its params. This filter type represents a filter with a known filter type.
 */
export type ClientIssueFilter = Omit<IssueFilter, "dates"> & {
  dates?: Interval;
};

export const fromClientFilter = (
  filter: ClientIssueFilter,
  filterType: DateFilterType,
): IssueFilter => {
  return {
    ...omit(filter, ["dates"]),
    dates: filter.dates
      ? {
          interval: filter.dates,
          filterType,
        }
      : undefined,
  };
};

export const toClientFilter = (filter: IssueFilter): ClientIssueFilter => {
  return {
    ...omit(filter, ["dates"]),
    dates: filter.dates?.interval,
    resolutions: filter.resolutions ?? defaultValuesFilter(),
    statuses: filter.statuses ?? defaultValuesFilter(),
    issueTypes: filter.issueTypes ?? defaultValuesFilter(),
    assignees: filter.assignees ?? defaultValuesFilter(),
    labels: filter.labels ?? defaultValuesFilter(),
    components: filter.components ?? defaultValuesFilter(),
  };
};
