import { boolean } from "@agileplanning-io/flow-lib";
import { useQueryState } from "@lib/use-query-state";
import { useEffect } from "react";
import { z } from "zod";

const defaultValues = {
  includeStoppedIssues: false,
  showPercentileLabels: true,
};

const chartParamsSchema = z
  .object({
    includeStoppedIssues: boolean.schema.catch(
      defaultValues.includeStoppedIssues,
    ),
    showPercentileLabels: boolean.schema.catch(
      defaultValues.showPercentileLabels,
    ),
  })
  .optional();

export type ChartParams = z.infer<typeof chartParamsSchema>;

export const useChartParams = () => {
  const [chartParams, setChartParams] = useQueryState(
    "c",
    chartParamsSchema.parse,
  );

  useEffect(() => {
    if (!chartParams) {
      setChartParams(defaultValues);
    }
  }, [chartParams, setChartParams]);

  return { chartParams: chartParams ?? defaultValues, setChartParams };
};
