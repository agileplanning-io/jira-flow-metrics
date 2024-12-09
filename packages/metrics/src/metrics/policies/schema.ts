import { z } from "zod";
import { FilterType, ValuesFilter } from "../../issues";
import {
  CycleTimePolicy,
  CycleTimePolicyType,
  EpicCycleTimePolicy,
  EpicCycleTimePolicyType,
} from "./cycle-time-policy";

const valuesFilterSchema: z.Schema<ValuesFilter> = z.object({
  values: z.array(z.string()).optional(),
  type: z.enum([FilterType.Include, FilterType.Exclude]),
});

const epicCycleTimePolicySchema: z.Schema<EpicCycleTimePolicy> =
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal(EpicCycleTimePolicyType.EpicStatus),
      statuses: z.array(z.string()),
    }),
    z.object({
      type: z.literal(EpicCycleTimePolicyType.Derived),
      labels: valuesFilterSchema.optional(),
      issueTypes: valuesFilterSchema.optional(),
      resolutions: valuesFilterSchema.optional(),
      components: valuesFilterSchema.optional(),
    }),
  ]);

export const cycleTimePolicySchema: z.Schema<CycleTimePolicy> = z.object({
  type: z.nativeEnum(CycleTimePolicyType),
  statuses: z.array(z.string()),
  epics: epicCycleTimePolicySchema,
});
