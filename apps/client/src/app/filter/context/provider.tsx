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
    filterSchema.parse,
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
  values: z.array(z.string()).default([]),
  type: z
    .enum([FilterType.Include, FilterType.Exclude])
    .default(FilterType.Include),
});

const filterSchema = z
  .object({
    hierarchyLevel: z
      .enum([HierarchyLevel.Epic, HierarchyLevel.Story])
      .optional(),
    issueTypes: valuesFilterSchema.default(defaultValuesFilter()),
    labels: valuesFilterSchema.default(defaultValuesFilter()),
    components: valuesFilterSchema.default(defaultValuesFilter()),
    resolutions: valuesFilterSchema.default(defaultValuesFilter()),
    assignees: valuesFilterSchema.default(defaultValuesFilter()),
    statuses: valuesFilterSchema.default(defaultValuesFilter()),
    dates: z
      .object({
        start: z.coerce.date(),
        end: z.coerce.date(),
      })
      .default(defaultDateRange()),
  })
  .optional();
