import { Interval } from "@agileplanning-io/flow-lib";
import {
  DateFilterType,
  IssueFilter,
  defaultValuesFilter,
} from "@agileplanning-io/flow-metrics";
import { omit } from "remeda";

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
