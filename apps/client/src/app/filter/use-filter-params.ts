import { z } from "zod";
import { ClientIssueFilter } from "./client-issue-filter";
import { useCallback, useEffect, useMemo } from "react";
import { useQueryState } from "@lib/use-query-state";
import { FilterType, HierarchyLevel } from "@agileplanning-io/flow-metrics";
import { defaultDateRange } from "@agileplanning-io/flow-lib";
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
    // if (defaults) {
    //   return defaults;
    // }
    const schemaDefaults: FilterParamsType = filterSchema.parse({});

    if (!defaults || !schemaDefaults) {
      return schemaDefaults;
    }

    const defaultValues = {
      ...schemaDefaults,
      ...(typeof defaults === "function" ? defaults(project) : defaults),
    };

    return defaultValues;
    // return defaults
    //   ? {
    //       ...filterSchema.parse({}),
    //       // ...(typeof defaults === "function" ? defaults(project) : defaults),
    //     }
    //   : filterSchema.parse({});
  }, [project, defaults]);

  const [filter, setFilter] = useQueryState<FilterParamsType>("f", parse);

  useEffect(() => {
    if (!filter && defaultValues) {
      setFilter(defaultValues);
    }
  }, [filter, setFilter, defaultValues]);

  return {
    filter: filter ?? defaultValues,
    setFilter: (filter) => {
      if (defaultValues) {
        setFilter({ ...defaultValues, ...filter });
      }
    },
  };
};

const defaultValuesFilter = () => ({
  values: [],
  type: FilterType.Include,
});

const valuesFilterSchema = z.object({
  values: z.array(z.string()).default([]).optional(),
  type: z
    .enum([FilterType.Include, FilterType.Exclude])
    .default(FilterType.Include)
    .optional(),
});

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
    dates: z
      .object({
        start: z.coerce.date(),
        end: z.coerce.date(),
      })
      .default(defaultDateRange())
      .optional(),
  })
  .optional();

type FilterParamsType = z.infer<typeof filterSchema>;
