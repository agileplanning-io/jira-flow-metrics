import { TimeUnit } from "@agileplanning-io/flow-lib";
import { booleanSchema } from "@lib/boolean-schema";
import { useQueryState } from "@lib/use-query-state";
import { useEffect } from "react";
import { z } from "zod";

const defaultValues = {
  timeUnit: TimeUnit.Week,
  showPercentileLabels: true,
};

const chartParamsSchema = z
  .object({
    timeUnit: z
      .enum([TimeUnit.Day, TimeUnit.Week, TimeUnit.Fortnight, TimeUnit.Month])
      .catch(defaultValues.timeUnit),
    showPercentileLabels: booleanSchema.catch(
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
