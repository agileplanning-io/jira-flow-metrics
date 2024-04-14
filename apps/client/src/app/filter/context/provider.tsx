import { FilterType, HierarchyLevel } from "@agileplanning-io/flow-metrics";
import { ClientIssueFilter, FilterContext } from "./context";
import { useQueryState } from "@lib/use-query-state";
import { z } from "zod";
import { defaultDateRange } from "@agileplanning-io/flow-lib";

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [filter, setFilter] = useQueryState<ClientIssueFilter | undefined>(
    "f",
    (value: unknown) => filterSchema.parse(value),
  );

  return (
    <FilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </FilterContext.Provider>
  );
};

const defaultValuesFilter = () => ({
  values: [],
  type: FilterType.Include,
});

const valuesFilterSchema = z.object({
  values: z.array(z.string()).catch([]),
  type: z
    .enum([FilterType.Include, FilterType.Exclude])
    .catch(FilterType.Include),
});

const filterSchema = z
  .object({
    hierarchyLevel: z
      .enum([HierarchyLevel.Epic, HierarchyLevel.Story])
      .optional(),
    issueTypes: valuesFilterSchema.catch(defaultValuesFilter()),
    labels: valuesFilterSchema.catch(defaultValuesFilter()),
    components: valuesFilterSchema.catch(defaultValuesFilter()),
    resolutions: valuesFilterSchema.catch(defaultValuesFilter()),
    assignees: valuesFilterSchema.catch(defaultValuesFilter()),
    statuses: valuesFilterSchema.catch(defaultValuesFilter()),
    dates: z
      .object({
        start: z.date(),
        end: z.date(),
      })
      .catch(defaultDateRange()),
  })
  .optional();
