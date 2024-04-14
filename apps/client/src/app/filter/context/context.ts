import { Interval } from "@agileplanning-io/flow-lib";
import { DateFilterType, IssueFilter } from "@agileplanning-io/flow-metrics";
import { createContext } from "react";
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

export type FilterContextType = {
  filter: ClientIssueFilter | undefined;
  setFilter: (filter: ClientIssueFilter) => void;
};

export const FilterContext = createContext<FilterContextType>({
  filter: {},
  setFilter: () => {},
});
