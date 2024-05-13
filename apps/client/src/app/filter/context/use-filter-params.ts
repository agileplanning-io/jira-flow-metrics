import { z } from "zod";
import { ClientIssueFilter } from "./client-issue-filter";
import { useCallback, useEffect, useMemo } from "react";
import { useQueryState } from "@lib/use-query-state";
import { FilterType, HierarchyLevel } from "@agileplanning-io/flow-metrics";
import { defaultDateRange } from "@agileplanning-io/flow-lib";
import { Project } from "@data/projects";
import { useProjectContext } from "@app/projects/context";

export const useFilterParams = (
  defaults?:
    | Partial<ClientIssueFilter>
    | ((project: Project) => Partial<ClientIssueFilter>),
) => {
  const { project } = useProjectContext();

  const parse = useCallback((data: unknown) => {
    const result = filterSchema.safeParse(data);
    return result.success ? result.data : undefined;
  }, []);

  const defaultValues = useMemo(() => {
    if (!project) return undefined;
    return defaults
      ? {
          ...filterSchema.parse({}),
          ...(typeof defaults === "function" ? defaults(project) : defaults),
        }
      : filterSchema.parse({});
  }, [project, defaults]);

  const [filter, setFilter] = useQueryState("f", parse);

  useEffect(() => {
    if (!filter && defaultValues) {
      setFilter(defaultValues);
    }
  }, [filter, setFilter, defaultValues]);

  return { filter: filter ?? defaultValues, setFilter };
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
    issueTypes: valuesFilterSchema.default(defaultValuesFilter()).optional(),
    labels: valuesFilterSchema.default(defaultValuesFilter()).optional(),
    components: valuesFilterSchema.default(defaultValuesFilter()).optional(),
    resolutions: valuesFilterSchema.default(defaultValuesFilter()).optional(),
    assignees: valuesFilterSchema.default(defaultValuesFilter()).optional(),
    statuses: valuesFilterSchema.default(defaultValuesFilter()).optional(),
    dates: z
      .object({
        start: z.coerce.date(),
        end: z.coerce.date(),
      })
      .default(defaultDateRange())
      .optional(),
  })
  .optional();
