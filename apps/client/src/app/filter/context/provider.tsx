import { HierarchyLevel, IssueFilter } from "@jbrunton/flow-metrics";
import { FilterContext } from "./context";
import { useSearchParams } from "react-router-dom";
import { equals, pick } from "rambda";
import { Interval } from "@jbrunton/flow-lib";
import { endOfDay, format, parse } from "date-fns";

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filter: IssueFilter = {
    dates: parseDates(searchParams),
    hierarchyLevel:
      (searchParams.get("hierarchyLevel") as HierarchyLevel) ?? undefined,
    resolutions: searchParams.getAll("resolution") ?? undefined,
    statuses: searchParams.getAll("status") ?? undefined,
    issueTypes: searchParams.getAll("issueType") ?? undefined,
    assignees: searchParams.getAll("assignees") ?? undefined,
  };

  const setFilter = (newFilter: IssueFilter) => {
    const fieldsToCompare = [
      "hierarchyLevel",
      "resolutions",
      "statuses",
      "issueTypes",
      "assignees",
      "dates",
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
            .setAll("resolution", newFilter.resolutions)
            .setAll("status", newFilter.statuses)
            .setAll("issueType", newFilter.issueTypes)
            .setAll("assignees", newFilter.assignees)
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

class SearchParamsBuilder {
  constructor(private readonly params: URLSearchParams) {}

  set(name: string, value?: string | Date) {
    if (value) {
      if (typeof value === "string") {
        this.params.set(name, value);
      } else {
        this.params.set(name, format(value, "yyyy-MM-dd"));
      }
    } else {
      this.params.delete(name);
    }
    return this;
  }

  setAll(name: string, value?: string[]) {
    this.params.delete(name);
    if (value && value.length) {
      value.forEach((v) => this.params.append(name, v));
    }
    return this;
  }

  getParams() {
    return this.params;
  }
}
