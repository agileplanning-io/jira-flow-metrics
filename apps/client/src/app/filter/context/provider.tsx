import {
  HierarchyLevel,
  IssueFilter,
  LabelFilterType,
} from "@agileplanning-io/flow-metrics";
import { FilterContext } from "./context";
import { useSearchParams } from "react-router-dom";
import { equals, pick } from "rambda";
import { Interval } from "@agileplanning-io/flow-lib";
import { endOfDay, parse } from "date-fns";
import { SearchParamsBuilder } from "@lib/search-params-builder";
import { z } from "zod";
import { useParams } from "@lib/params";

function optionalParam<T extends z.ZodSchema>(schema: T) {
  return z.preprocess(
    (val) => (val === "" ? undefined : val),
    schema.optional(),
  );
}

const filterParamsSchema = z.object({
  dates: z.tuple([z.coerce.date(), z.coerce.date()]).optional(),
  hierarchyLevel: optionalParam(
    z.enum([HierarchyLevel.Story, HierarchyLevel.Epic]),
  ),
  resolutions: z.array(z.string()).optional(),
  filterStatuses: optionalParam(z.array(z.string())),
  issueTypes: z.array(z.string()).optional(),
  assignees: z.array(z.string()).optional(),
  labels: z.array(z.string()).optional(),
  labelFilterType: z
    .enum([LabelFilterType.Include, LabelFilterType.Exclude])
    .catch(LabelFilterType.Include)
    .optional(),
  components: z.array(z.string()).optional(),
});

type FilterParams = z.infer<typeof filterParamsSchema>;

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [params, setParams] = useParams(filterParamsSchema);

  const filter = toFilter(params);
  console.info(filter);
  const setFilter = (filter: IssueFilter) => setParams(fromFilter(filter));
  // const [searchParams, setSearchParams] = useSearchParams();

  // const filter: IssueFilter = {
  //   dates: parseDates(searchParams),
  //   hierarchyLevel:
  //     (searchParams.get("hierarchyLevel") as HierarchyLevel) ??
  //     HierarchyLevel.Story,
  //   resolutions: searchParams.getAll("resolutions") ?? undefined,
  //   statuses: searchParams.getAll("filterStatuses") ?? undefined,
  //   issueTypes: searchParams.getAll("issueTypes") ?? undefined,
  //   assignees: searchParams.getAll("assignees") ?? undefined,
  //   labels: searchParams.getAll("labels") ?? undefined,
  //   labelFilterType:
  //     (searchParams.get("labelFilterType") as LabelFilterType) ??
  //     LabelFilterType.Include,
  //   components: searchParams.getAll("components") ?? undefined,
  // };

  // const setFilter = (newFilter: IssueFilter) => {
  //   const fieldsToCompare = [
  //     "hierarchyLevel",
  //     "resolutions",
  //     "statuses",
  //     "issueTypes",
  //     "assignees",
  //     "dates",
  //     "labels",
  //     "labelFilterType",
  //     "components",
  //   ];
  //   const changed = !equals(
  //     pick(fieldsToCompare, newFilter),
  //     pick(fieldsToCompare, filter),
  //   );
  //   if (changed) {
  //     setSearchParams(
  //       (prev) => {
  //         return new SearchParamsBuilder(prev)
  //           .set("hierarchyLevel", newFilter.hierarchyLevel as string)
  //           .set("fromDate", newFilter.dates?.start)
  //           .set("toDate", newFilter.dates?.end)
  //           .setAll("resolutions", newFilter.resolutions)
  //           .setAll("filterStatuses", newFilter.statuses)
  //           .setAll("issueTypes", newFilter.issueTypes)
  //           .setAll("assignees", newFilter.assignees)
  //           .setAll("labels", newFilter.labels)
  //           .set("labelFilterType", newFilter.labelFilterType)
  //           .setAll("components", newFilter.components)
  //           .getParams();
  //       },
  //       { replace: true },
  //     );
  //   }
  // };

  return (
    <FilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </FilterContext.Provider>
  );
};

// const parseDates = (params: URLSearchParams): Interval | undefined => {
//   const fromDateString = params.get("fromDate");
//   const toDateString = params.get("toDate");
//   if (fromDateString && toDateString) {
//     return {
//       start: parse(fromDateString, "yyyy-MM-dd", new Date()),
//       end: endOfDay(parse(toDateString, "yyyy-MM-dd", new Date())),
//     };
//   }
// };

const toFilter = (filter: FilterParams): IssueFilter => ({
  ...filter,
  dates: filter.dates
    ? {
        start: filter.dates[0],
        end: filter.dates[1],
      }
    : undefined,
  statuses: filter.filterStatuses,
});

const fromFilter = (filter: IssueFilter): FilterParams => ({
  ...filter,
  dates: filter.dates ? [filter.dates.start, filter.dates.end] : undefined,
  filterStatuses: filter.statuses,
});
