import { z } from "zod";
import { useCallback, useEffect, useMemo } from "react";
import { useQueryState } from "@lib/use-query-state";
import {
  ClientIssueFilter,
  filterSchema,
  intervalSchema,
} from "@agileplanning-io/flow-metrics";
import { Project } from "@data/projects";
import { useProjectContext } from "@app/projects/context";
import { defaultDateRange } from "@agileplanning-io/flow-lib";

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
    const result = clientFilterSchema.safeParse(data);
    return result.success ? result.data : undefined;
  }, []);

  const defaultValues: FilterParamsType = useMemo(() => {
    if (!project) return undefined;

    const schemaDefaults: FilterParamsType = clientFilterSchema.parse({});

    if (!schemaDefaults) {
      // TODO: enforce this with schema. TBD: can this ever occur?
      return undefined;
    }

    return {
      ...schemaDefaults,
      ...(typeof defaults === "function" ? defaults(project) : defaults),
    };
  }, [project, defaults]);

  const [filterParams, setFilterParams] = useQueryState<FilterParamsType>(
    "f",
    parse,
  );

  useEffect(() => {
    if (!filterParams && defaultValues) {
      setFilterParams(defaultValues, { replace: true });
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

const clientFilterSchema = filterSchema
  .extend({
    dates: intervalSchema.default(defaultDateRange()),
  })
  .optional();

type FilterParamsType = z.infer<typeof clientFilterSchema>;
