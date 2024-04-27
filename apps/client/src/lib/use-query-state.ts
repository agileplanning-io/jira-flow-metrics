import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { mergeDeep } from "remeda";
import { qsParse, qsStringify } from "@agileplanning-io/flow-lib";

// inspired by https://www.inkoop.io/blog/syncing-query-parameters-with-react-state/

export const useQueryState = <T>(
  key: string,
  parser?: (value: unknown) => T,
): [T | undefined, (value: T | undefined) => void] => {
  const [params, setParams] = useSearchParams();

  const setQuery = useCallback(
    (value: unknown) => {
      setParams((prev) => {
        const existingQuery = qsParse(prev.toString());
        const newQuery = { [key]: value };
        const updatedQuery = qsStringify(mergeDeep(existingQuery, newQuery));
        return new URLSearchParams(updatedQuery);
      });
    },
    [setParams, key],
  );

  const queryString = params.toString();

  const result = useMemo(() => {
    const queryObject = qsParse(queryString);
    const query = queryObject[key] as T | undefined;

    return parser ? parser(query) : query;
  }, [queryString, key, parser]);

  return [result, setQuery];
};
