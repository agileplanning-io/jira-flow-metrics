import { z } from "zod";
import { FilterType, ValuesFilter } from "../../issues";
import {
  ComputedCycleTimePolicy,
  CycleTimePolicy,
  StatusCategoryCycleTimePolicy,
  StatusCycleTimePolicy,
} from "./cycle-time-policy";

const valuesFilterSchema: z.Schema<ValuesFilter> = z.object({
  values: z.array(z.string()).optional(),
  type: z.enum([FilterType.Include, FilterType.Exclude]),
});

const statusCycleTimePolicySchema: z.Schema<StatusCycleTimePolicy> = z.object({
  type: z.literal("status"),
  includeWaitTime: z.boolean(),
  statuses: z.array(z.string()).optional(),
});

const statusCategoryCycleTimePolicySchema: z.Schema<StatusCategoryCycleTimePolicy> =
  z.object({
    type: z.literal("statusCategory"),
    includeWaitTime: z.boolean(),
  });

const computedCycleTimePolicySchema: z.Schema<ComputedCycleTimePolicy> =
  z.object({
    type: z.literal("computed"),
    includeWaitTime: z.boolean(),
    labels: valuesFilterSchema.optional(),
    issueTypes: valuesFilterSchema.optional(),
    resolutions: valuesFilterSchema.optional(),
    components: valuesFilterSchema.optional(),
  });

export const cycleTimePolicySchema: z.Schema<CycleTimePolicy> = z.object({
  stories: z.union([
    statusCycleTimePolicySchema,
    statusCategoryCycleTimePolicySchema,
  ]),
  epics: z.union([
    statusCycleTimePolicySchema,
    statusCategoryCycleTimePolicySchema,
    computedCycleTimePolicySchema,
  ]),
});
