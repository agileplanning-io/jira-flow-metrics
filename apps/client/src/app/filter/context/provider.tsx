import {
  HierarchyLevel,
  IssueFilter,
  FilterType,
} from "@agileplanning-io/flow-metrics";
import { FilterContext } from "./context";
import { useSearchParams } from "react-router-dom";
import { equals, pick } from "rambda";
import { Interval } from "@agileplanning-io/flow-lib";
import { endOfDay, parse } from "date-fns";
import { SearchParamsBuilder } from "@lib/search-params-builder";

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filter: IssueFilter = {
    dates: parseDates(searchParams),
    hierarchyLevel: searchParams.get("hierarchyLevel") as HierarchyLevel,
    resolutions: searchParams.getAll("resolutions") ?? undefined,
    statuses: searchParams.getAll("filterStatuses") ?? undefined,
    issueTypes: searchParams.getAll("issueTypes") ?? undefined,
    issueTypeFilterType:
      (searchParams.get("issueTypeFilterType") as FilterType) ??
      FilterType.Include,
    assignees: searchParams.getAll("assignees") ?? undefined,
    labels: searchParams.getAll("labels") ?? undefined,
    labelFilterType:
      (searchParams.get("labelFilterType") as FilterType) ?? FilterType.Include,
    components: searchParams.getAll("components") ?? undefined,
  };

  const setFilter = (newFilter: IssueFilter) => {
    const fieldsToCompare = [
      "hierarchyLevel",
      "resolutions",
      "statuses",
      "issueTypes",
      "issueTypeFilterType",
      "assignees",
      "dates",
      "labels",
      "labelFilterType",
      "components",
    ];
    const changed = !equals(
      pick(fieldsToCompare, newFilter),
      pick(fieldsToCompare, filter),
    );
    if (changed) {
      setSearchParams(
        (prev) => {
          return new SearchParamsBuilder(prev)
            .set("hierarchyLevel", newFilter.hierarchyLevel as string)
            .set("fromDate", newFilter.dates?.start)
            .set("toDate", newFilter.dates?.end)
            .setAll("resolutions", newFilter.resolutions)
            .setAll("filterStatuses", newFilter.statuses)
            .setAll("issueTypes", newFilter.issueTypes)
            .set("issueTypeFilterType", newFilter.issueTypeFilterType)
            .setAll("assignees", newFilter.assignees)
            .setAll("labels", newFilter.labels)
            .set("labelFilterType", newFilter.labelFilterType)
            .setAll("components", newFilter.components)
            .getParams();
        },
        { replace: true },
      );
    }
  };

  return (
    <FilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </FilterContext.Provider>
  );
};

const parseDates = (params: URLSearchParams): Interval | undefined => {
  const fromDateString = params.get("fromDate");
  const toDateString = params.get("toDate");
  if (fromDateString && toDateString) {
    return {
      start: parse(fromDateString, "yyyy-MM-dd", new Date()),
      end: endOfDay(parse(toDateString, "yyyy-MM-dd", new Date())),
    };
  }
};
