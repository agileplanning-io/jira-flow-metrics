import { IssueFilter } from "@agileplanning-io/flow-metrics";
import { FilterContext } from "./context";
import { useQueryState } from "@lib/use-query-state";

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [filter, setFilter] = useQueryState<IssueFilter>("filter");

  return (
    <FilterContext.Provider value={{ filter: filter ?? {}, setFilter }}>
      {children}
    </FilterContext.Provider>
  );
};
