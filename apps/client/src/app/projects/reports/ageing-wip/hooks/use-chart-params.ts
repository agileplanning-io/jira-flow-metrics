import { booleanSchema } from "@lib/boolean-schema";
import { z } from "zod";
import { useChartParamsState } from "../../hooks/use-chart-params";

const chartParamsSchema = z.object({
  includeStoppedIssues: booleanSchema.default("false"),
  showPercentileLabels: booleanSchema.default("true"),
});

export type ChartParams = z.infer<typeof chartParamsSchema>;

export const useChartParams = () => useChartParamsState(chartParamsSchema);
