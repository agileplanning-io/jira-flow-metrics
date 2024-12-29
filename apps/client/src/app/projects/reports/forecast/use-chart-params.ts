import { boolean } from "@agileplanning-io/flow-lib";
import { z } from "zod";
import { useChartParamsState } from "../hooks/use-chart-params";

export const newSeed = () =>
  Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

const chartParamsSchema = z.object({
  issueCount: z.coerce.number().default(10),
  startDate: z.coerce.date().optional(),
  seed: z.coerce.number().default(newSeed()),
  includeLongTail: boolean.schema.default(boolean.False),
  includeLeadTimes: boolean.schema.default(boolean.True),
  excludeOutliers: boolean.schema.default(boolean.False),
  showPercentileLabels: boolean.schema.default(boolean.True),
});

const defaults = {
  startDate: new Date(),
};

export type ChartParams = z.infer<typeof chartParamsSchema>;

export const useChartParams = () =>
  useChartParamsState(chartParamsSchema, defaults);
