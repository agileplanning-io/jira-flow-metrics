import { ForecastParams } from "@agileplanning-io/flow-metrics";
import { SearchParamsBuilder } from "@lib/search-params-builder";
import { parse } from "date-fns";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type ForecastChartParams = Omit<ForecastParams, "selectedIssues">;

export const useForecastChartParams = (): {
  chartParams: ForecastChartParams;
  setChartParams: (params: ForecastChartParams) => void;
} => {
  const [searchParams, setSearchParams] = useSearchParams();

  const chartParams = useMemo(
    () => ({
      issueCount: parseInt(searchParams.get("issueCount")) ?? 10,
      startDate: parseStartDate(searchParams),
      seed: parseInt(searchParams.get("seed")) ?? newSeed(),

      includeLongTail: searchParams.get("includeLongTail") === "true",
      excludeLeadTimes: searchParams.get("excludeLeadTimes") === "true",
      excludeOutliers: searchParams.get("excludeOutliers") === "true",
    }),
    [searchParams],
  );

  const setChartParams = (newParams: ForecastChartParams) => {
    setSearchParams((params) => {
      return new SearchParamsBuilder(params)
        .set("issueCount", newParams.issueCount)
        .set("startDate", newParams.startDate)
        .set("seed", newParams.seed)
        .set("includeLongTail", newParams.includeLongTail)
        .set("excludeLeadTimes", newParams.excludeLeadTimes)
        .set("excludeOutliers", newParams.excludeOutliers)
        .getParams();
    });
  };

  return { chartParams, setChartParams };
};

const parseStartDate = (params: URLSearchParams): Date | undefined => {
  const startDateString = params.get("startDate");
  if (startDateString) {
    return parse(startDateString, "yyyy-MM-dd", new Date());
  }
};

export const newSeed = () =>
  Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

const parseInt = (input: unknown): number | undefined => {
  const value = typeof input === "string" ? Number.parseInt(input) : undefined;

  if (Number.isInteger(value)) {
    return value;
  }
};
