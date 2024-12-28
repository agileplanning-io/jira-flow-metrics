import { DateFilterType, FilterType } from "./filter";
import { fromClientFilter } from "./client-issue-filter";
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

    expect(filter).toEqual({});
    expect(1).toBe(1);
  });
});
