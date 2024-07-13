import { z } from "zod";
import { ClientIssueFilter } from "./client-issue-filter";
import { useCallback, useEffect, useMemo } from "react";
import { useQueryState } from "@lib/use-query-state";
import {
  FilterType,
  HierarchyLevel,
  defaultValuesFilter,
} from "@agileplanning-io/flow-metrics";
import { TimeUnit, defaultDateRange } from "@agileplanning-io/flow-lib";
import { Project } from "@data/projects";
import { useProjectContext } from "@app/projects/context";

export type FilterParams = {
  filter: ClientIssueFilter | undefined;
  setFilter: (filter: ClientIssueFilter | undefined) => void;
};

export const useFilterParams = (
  defaults?:
    | Partial<ClientIssueFilter>
    | ((project: Project) => Partial<ClientIssueFilter>),
): FilterParams => {
  const { project } = useProjectContext();

  const parse = useCallback((data: unknown) => {
    const result = filterSchema.safeParse(data);
    return result.success ? result.data : undefined;
  }, []);

  const defaultValues: FilterParamsType = useMemo(() => {
    if (!project) return undefined;

    const schemaDefaults: FilterParamsType = filterSchema.parse({});

    if (!schemaDefaults) {
      // TODO: enforce this with schema. TBD: can this ever occur?
      return undefined;
    }

    const defaultValues = {
      ...schemaDefaults,
      ...(typeof defaults === "function" ? defaults(project) : defaults),
    };

    return defaultValues;
  }, [project, defaults]);

  const [filterParams, setFilterParams] = useQueryState<FilterParamsType>(
    "f",
    parse,
    false,
  );

  useEffect(() => {
    if (!filterParams && defaultValues) {
      setFilterParams(defaultValues);
    }
  }, [filterParams, setFilterParams, defaultValues]);

  const filter: FilterParams["filter"] = filterParams ?? defaultValues;

  const setFilter: FilterParams["setFilter"] = (filter) => {
    if (defaultValues) {
      setFilterParams({ ...defaultValues, ...filter });
    }
  };

  return { filter, setFilter };
};

const valuesFilterSchema = z.object({
  values: z.array(z.string()).default([]).optional(),
  type: z
    .enum([FilterType.Include, FilterType.Exclude])
    .default(FilterType.Include)
    .optional(),
});

const datesSchema = z
  .union([
    z.object({
      end: z.coerce.date(),
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
  ])
  .optional();

const filterSchema = z
  .object({
    hierarchyLevel: z
      .enum([HierarchyLevel.Epic, HierarchyLevel.Story])
      .optional(),
    issueTypes: valuesFilterSchema.default(defaultValuesFilter()),
    labels: valuesFilterSchema.default(defaultValuesFilter()),
    components: valuesFilterSchema.default(defaultValuesFilter()),
    resolutions: valuesFilterSchema.default(defaultValuesFilter()),
    assignees: valuesFilterSchema.default(defaultValuesFilter()),
    statuses: valuesFilterSchema.default(defaultValuesFilter()),
    dates: datesSchema.default(defaultDateRange()),
  })
  .optional();

type FilterParamsType = z.infer<typeof filterSchema>;
