import { booleanSchema } from "@lib/boolean-schema";
import { useQueryState } from "@lib/use-query-state";
import { useEffect } from "react";
import { z } from "zod";

export const newSeed = () =>
  Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

const defaultParamValues = {
  issueCount: 10,
  startDate: new Date(),
  seed: newSeed(),
  includeLongTail: false,
  includeLeadTimes: true,
  excludeOutliers: false,
  showPercentileLabels: false,
};

const forecastChartParamsSchema = z
  .object({
    issueCount: z.coerce.number().catch(defaultParamValues.issueCount),
    startDate: z.coerce.date().optional().catch(defaultParamValues.startDate),
    seed: z.coerce.number().catch(defaultParamValues.seed),
    includeLongTail: booleanSchema.catch(defaultParamValues.includeLongTail),
    includeLeadTimes: booleanSchema.catch(defaultParamValues.includeLeadTimes),
    excludeOutliers: booleanSchema.catch(defaultParamValues.excludeOutliers),
    showPercentileLabels: booleanSchema.catch(
      defaultParamValues.showPercentileLabels,
    ),
  })
  .optional();

export type ForecastChartParams = z.infer<typeof forecastChartParamsSchema>;

export const useForecastChartParams = () => {
  const [chartParams, setChartParams] = useQueryState(
    "c",
    forecastChartParamsSchema.parse,
  );

  useEffect(() => {
    if (!chartParams) {
      setChartParams(defaultParamValues);
    }
  }, [chartParams, setChartParams]);

  return { chartParams, setChartParams };
};
