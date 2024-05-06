import { boolean } from "@agileplanning-io/flow-lib";
import { z } from "zod";
import { useChartParamsState } from "../../hooks/use-chart-params";

const chartParamsSchema = z.object({
  hideOutliers: boolean.schema.default(boolean.False),
  showPercentileLabels: boolean.schema.default(boolean.True),
});

export type ChartParams = z.infer<typeof chartParamsSchema>;

export const useChartParams = () => useChartParamsState(chartParamsSchema);
