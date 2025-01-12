import { z } from "zod";
import {
  DateFilterType,
  DatesFilter,
  FilterType,
  IssueFilter,
  ValuesFilter,
} from "./filter";
import { HierarchyLevel } from "./issues";
import { TimeUnit, Interval } from "@agileplanning-io/flow-lib";

const hierarchyLevelSchema: z.Schema<HierarchyLevel> = z.enum([
  HierarchyLevel.Story,
  HierarchyLevel.Epic,
]);

const filterType: z.Schema<FilterType> = z.enum([
  FilterType.Include,
  FilterType.Exclude,
]);

const valuesFilterSchema: z.Schema<ValuesFilter> = z.object({
  values: z.array(z.string()).optional(),
  type: filterType.optional(),
});

export const intervalSchema: z.Schema<Interval> = z.union([
  z.object({
    unit: z.enum([
      TimeUnit.Day,
      TimeUnit.Week,
      TimeUnit.Fortnight,
      TimeUnit.Month,
    ]),
    unitCount: z.coerce.number(),
  }),
  z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }),
]);

const dateFilterSchema: z.Schema<DatesFilter> = z.object({
  interval: intervalSchema,
  filterType: z.enum([DateFilterType.Completed, DateFilterType.Overlaps]),
});

export const filterSchema = z.object({
  hierarchyLevel: hierarchyLevelSchema.optional(),
  issueTypes: valuesFilterSchema.optional(),
  labels: valuesFilterSchema.optional(),
  components: valuesFilterSchema.optional(),
  resolutions: valuesFilterSchema.optional(),
  assignees: valuesFilterSchema.optional(),
  statuses: valuesFilterSchema.optional(),
  dates: dateFilterSchema.optional(),
}) satisfies z.Schema<IssueFilter>;
