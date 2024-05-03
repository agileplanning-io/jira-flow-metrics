import { FilterType } from "@agileplanning-io/flow-metrics";
import { booleanSchema } from "@lib/boolean-schema";
import { z } from "zod";

const valuesFilterSchema = z.object({
  values: z.array(z.string()).optional(),
  type: z.enum([FilterType.Include, FilterType.Exclude]),
});

const statusCycleTimePolicySchema = z.object({
  type: z.literal("status"),
  includeWaitTime: booleanSchema,
  statuses: z.array(z.string()),
});

const computedCycleTimePolicySchema = z.object({
  type: z.literal("computed"),
  labelsFilter: valuesFilterSchema,
  issueTypesFilter: valuesFilterSchema,
});

export const cycleTimePolicySchema = z
  .object({
    stories: statusCycleTimePolicySchema,
    epics: z.discriminatedUnion("type", [
      statusCycleTimePolicySchema,
      computedCycleTimePolicySchema,
    ]),
  })
  .optional();
