import { DateFilterType, defaultValuesFilter, FilterType } from "./filter";
import { fromClientFilter, toClientFilter } from "./client-issue-filter";
import { addDays } from "date-fns";

describe("fromClientFilter", () => {
  it("converts a ClientIssueFilter to an IssueFilter", () => {
    const start = new Date();
    const end = addDays(start, 1);

    const filter = fromClientFilter(
      {
        dates: { start, end },
        resolutions: {
          values: ["Done"],
          type: FilterType.Include,
        },
      },
      DateFilterType.Completed,
    );

    expect(filter).toEqual({
      dates: {
        filterType: DateFilterType.Completed,
        interval: {
          start,
          end,
        },
      },
      resolutions: {
        type: FilterType.Include,
        values: ["Done"],
      },
    });
  });

  it("converts an IssueFilter to a ClientIssueFilter", () => {
    const start = new Date();
    const end = addDays(start, 1);

    const filter = toClientFilter({
      dates: { filterType: DateFilterType.Completed, interval: { start, end } },
      resolutions: {
        values: ["Done"],
        type: FilterType.Include,
      },
    });

    expect(filter).toEqual({
      dates: {
        start,
        end,
      },
      assignees: defaultValuesFilter(),
      components: defaultValuesFilter(),
      resolutions: {
        type: FilterType.Include,
        values: ["Done"],
      },
      issueTypes: defaultValuesFilter(),
      labels: defaultValuesFilter(),
      statuses: defaultValuesFilter(),
    });
  });
});
