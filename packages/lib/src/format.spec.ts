import {
  ellipsize,
  formatDate,
  formatInterval,
  formatNumber,
  formatTime,
} from "./format";

describe("format", () => {
  const now = new Date("2025-01-01");
  jest.useFakeTimers({ now });

  describe("formatNumber", () => {
    it("rounds to 1dp", () => {
      expect(formatNumber(1)).toEqual("1.0");
      expect(formatNumber(1.21)).toEqual("1.2");
      expect(formatNumber(1.26)).toEqual("1.3");
    });
  });

  describe("formatDate", () => {
    it("formats dates", () => {
      expect(formatDate(new Date("2024-03-01"))).toEqual("1 Mar 2024");
    });

    it("drops the year for dates in the current year", () => {
      expect(formatDate(new Date("2025-03-01"))).toEqual("1 Mar");
    });
  });

  describe("formatTime", () => {
    it("formats dates with times", () => {
      expect(formatTime(new Date("2024-03-01 10:35:00.000Z"))).toEqual(
        "Mar 1, 2024, 10:35 AM",
      );
    });
  });

  describe("formatInterval", () => {
    it("formats absolute intervals", () => {
      const interval = {
        start: new Date("2024-03-01"),
        end: new Date("2024-03-07"),
      };
      expect(formatInterval(interval)).toEqual("1 Mar 2024-7 Mar 2024");
    });

    it("drops the year for dates in the current year", () => {
      const interval = {
        start: new Date("2025-03-01"),
        end: new Date("2025-03-07"),
      };
      expect(formatInterval(interval)).toEqual("1 Mar-7 Mar");
    });

    it("includes the year for both dates if they span the current year", () => {
      const interval = {
        start: new Date("2024-03-01"),
        end: new Date("2025-03-01"),
      };
      expect(formatInterval(interval)).toEqual("1 Mar 2024-1 Mar 2025");
    });
  });

  describe("ellipsize", () => {
    it("returns short text verbatim", () => {
      expect(ellipsize("foo bar", 8)).toEqual("foo bar");
    });

    it("truncates long text, trimming white space", () => {
      expect(ellipsize("foo bar baz", 8)).toEqual("foo bar…");
    });
  });
});
