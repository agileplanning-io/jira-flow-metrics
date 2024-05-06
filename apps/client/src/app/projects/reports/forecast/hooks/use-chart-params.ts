import { booleanSchema } from "@lib/boolean-schema";
import { z } from "zod";
import { useChartParamsState } from "../../hooks/use-chart-params";

export const newSeed = () =>
  Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

const chartParamsSchema = z.object({
  issueCount: z.coerce.number().default(10),
  startDate: z.coerce.date().default(new Date()).optional(),
  seed: z.coerce.number().default(newSeed()),
  includeLongTail: booleanSchema.default("false"),
  includeLeadTimes: booleanSchema.default("true"),
  excludeOutliers: booleanSchema.default("false"),
  showPercentileLabels: booleanSchema.default("true"),
});

export type ChartParams = z.infer<typeof chartParamsSchema>;

export const useChartParams = () => useChartParamsState(chartParamsSchema);
