import { FilterType } from "@agileplanning-io/flow-metrics";
import { isNullish } from "remeda";
import { z } from "zod";

const booleanSchema = z
  .string()
  .optional()
  .transform((val) => (isNullish(val) || val === "false" ? false : true));

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
