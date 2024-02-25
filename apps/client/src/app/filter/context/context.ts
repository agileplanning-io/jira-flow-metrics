import { IssueFilter } from "@agileplanning-io/flow-metrics";
import { createContext } from "react";

export type FilterContextType = {
  filter: IssueFilter;
  setFilter: (filter: IssueFilter) => void;
};

export const FilterContext = createContext<FilterContextType>({
  filter: {},
  setFilter: () => {},
});
