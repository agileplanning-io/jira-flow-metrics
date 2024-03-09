import { equals, pick } from "rambda";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";

export type LinkToParams = {
  to: string;
  params: Record<string, unknown>;
};

export const linkTo = ({ to, params }: LinkToParams): string => {
  const query = encodeParams(params).toString();
  return `${to}/?${query}`;
};

export function useParams<T extends z.AnyZodObject>(
  schema: T,
): [z.infer<typeof schema>, (params: z.infer<typeof schema>) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = schema.parse(decodeParams(searchParams));
  const schemaKeys = Object.keys(schema.shape);

  const setParams = (newParams: z.infer<typeof schema>) => {
    const unchanged = equals(
      pick(schemaKeys, newParams),
      pick(schemaKeys, params),
    );

    if (unchanged) {
      return;
    }

    setSearchParams(
      (prev) => {
        const encodedParams = encodeParams(newParams);
        for (const [k, v] of encodedParams.entries()) {
          prev.set(k, v);
        }
        return prev;
      },
      { replace: true },
    );
  };

  return [params, setParams];
}

export function useParam<T extends z.AnyZodObject, K extends keyof z.infer<T>>(
  schema: T,
  key: K,
): [z.infer<T>[K], (value: z.infer<T>[K]) => void] {
  const [params, setParams] = useParams(schema);
  return [
    params[key],
    (value: z.infer<T>[K]) =>
      setParams({
        ...params,
        [key]: value,
      }),
  ];
}

const decodeParam = (value: string) => {
  try {
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return value;
  }
};

const decodeParams = (params: URLSearchParams): unknown => {
  const paramsAsObj = Object.fromEntries(params.entries());
  const decodedEntries = Object.entries(paramsAsObj).map(([k, v]) => {
    return [k, decodeParam(v)];
  });
  return Object.fromEntries(decodedEntries);
};

const encodeParam = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  } else {
    return encodeURIComponent(JSON.stringify(value));
  }
};

const encodeParams = (params: Record<string, unknown>): URLSearchParams => {
  const encodedEntries = Object.entries(params).map(([k, v]) => {
    return [k, encodeParam(v)];
  });
  return new URLSearchParams(encodedEntries);
};
