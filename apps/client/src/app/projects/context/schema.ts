import { FilterType } from "@agileplanning-io/flow-metrics";
import { boolean } from "@agileplanning-io/flow-lib";
import { z } from "zod";

const valuesFilterSchema = z.object({
  values: z.array(z.string()).optional(),
  type: z.enum([FilterType.Include, FilterType.Exclude]),
});

const statusCycleTimePolicySchema = z.object({
  type: z.literal("status"),
  includeWaitTime: boolean.schema,
  statuses: z.array(z.string()).optional(),
});

const statusCategoryCycleTimePolicySchema = z.object({
  type: z.literal("statusCategory"),
  includeWaitTime: boolean.schema,
});

const computedCycleTimePolicySchema = z.object({
  type: z.literal("computed"),
  includeWaitTime: boolean.schema,
  labels: valuesFilterSchema.optional(),
  issueTypes: valuesFilterSchema.optional(),
  resolutions: valuesFilterSchema.optional(),
  components: valuesFilterSchema.optional(),
});

export const cycleTimePolicySchema = z
  .object({
    stories: z.discriminatedUnion("type", [
      statusCycleTimePolicySchema,
      statusCategoryCycleTimePolicySchema,
    ]),
    epics: z.discriminatedUnion("type", [
      statusCycleTimePolicySchema,
      statusCategoryCycleTimePolicySchema,
      computedCycleTimePolicySchema,
    ]),
  })
  .optional();
