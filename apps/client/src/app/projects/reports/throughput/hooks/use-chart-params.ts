import { TimeUnit } from "@agileplanning-io/flow-lib";
import { boolean } from "@agileplanning-io/flow-lib";
import { z } from "zod";
import { useChartParamsState } from "../../hooks/use-chart-params";

const chartParamsSchema = z.object({
  timeUnit: z
    .enum([TimeUnit.Day, TimeUnit.Week, TimeUnit.Fortnight, TimeUnit.Month])
    .default(TimeUnit.Week),
  showPercentileLabels: boolean.schema.default(boolean.True),
});

export type ChartParams = z.infer<typeof chartParamsSchema>;

export const useChartParams = () => useChartParamsState(chartParamsSchema);
