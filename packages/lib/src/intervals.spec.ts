import { addDays, subDays } from "date-fns";
import { getSpanningInterval, getSpanningSet } from "./intervals";

describe("intervals", () => {
  const now = new Date();
  const todayInterval = { start: now, end: addDays(now, 1) };
  const laterInterval = { start: addDays(now, 2), end: addDays(now, 3) };
  const earlierInterval = { start: subDays(now, 2), end: subDays(now, 1) };

  describe("getSpanningInterval", () => {
    it("returns an interval which maximally spans the given pair of intervals", () => {
      expect(getSpanningInterval(todayInterval, laterInterval)).toEqual({
        start: todayInterval.start,
        end: laterInterval.end,
      });
      expect(getSpanningInterval(todayInterval, earlierInterval)).toEqual({
        start: earlierInterval.start,
        end: todayInterval.end,
      });
    });
  });

  describe("getSpanningSet", () => {
    it("returns given interval set, sorted, when none of the intervals overlap", () => {
      const spanningSet = getSpanningSet([
        todayInterval,
        earlierInterval,
        laterInterval,
      ]);
      expect(spanningSet).toEqual([
        earlierInterval,
        todayInterval,
        laterInterval,
      ]);
    });

    it("returns minimal spanning interval set when the intervals overlap", () => {
      const spanningInterval = {
        start: todayInterval.start,
        end: laterInterval.end,
      };

      const spanningSet = getSpanningSet([
        todayInterval,
        earlierInterval,
        laterInterval,
        spanningInterval,
      ]);

      expect(spanningSet).toEqual([earlierInterval, spanningInterval]);
    });
  });
});
