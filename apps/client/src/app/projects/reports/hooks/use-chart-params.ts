import { useQueryState } from "@lib/use-query-state";
import { useCallback, useEffect, useMemo } from "react";
import { z } from "zod";

export const useChartParamsState = <T extends z.ZodTypeAny>(schema: T) => {
  const parse = useCallback(
    (data: unknown) => {
      const result = schema.safeParse(data);
      return result.success ? result.data : undefined;
    },
    [schema],
  );

  const defaultValues = useMemo(() => schema.parse({}), [schema]);

  const [chartParams, setChartParams] = useQueryState("c", parse);

  useEffect(() => {
    if (!chartParams) {
      setChartParams(defaultValues);
    }
  }, [chartParams, setChartParams, defaultValues]);

  return { chartParams: chartParams ?? defaultValues, setChartParams };
};
