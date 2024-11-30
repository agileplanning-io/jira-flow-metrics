import { boolean } from "@agileplanning-io/flow-lib";
import { z } from "zod";
import { useChartParamsState } from "../../hooks/use-chart-params";
import { WipType } from "@agileplanning-io/flow-metrics";

const chartParamsSchema = z.object({
  includeStoppedIssues: boolean.schema.default(boolean.False),
  showPercentileLabels: boolean.schema.default(boolean.True),
  wipType: z.nativeEnum(WipType).default(WipType.LeadTime),
});

export type ChartParams = z.infer<typeof chartParamsSchema>;

export const useChartParams = () => useChartParamsState(chartParamsSchema);
