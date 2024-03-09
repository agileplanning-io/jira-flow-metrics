import { equals, pick } from "rambda";
import { useSearchParams } from "react-router-dom";
import { ZodSchema, z, ZodObject } from "zod";

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
  const keys = Object.keys(schema.shape);
  const setParams = (newParams: z.infer<typeof schema>) => {
    const changed = !equals(pick(keys, newParams), pick(keys, params));
    if (changed) {
      setSearchParams(
        (prev) => {
          const encodedParams = encodeParams(newParams);
          Object.entries(asObject(encodedParams)).forEach(([k, v]) => {
            console.info("set param", k, v);
            prev.set(k, v);
          });
          console.info("updating params", { params, newParams });
          return prev;
          // return prev;
        },
        { replace: true },
      );
    }
    //setSearchParams(encodeParams(params));
  };
  return [params, setParams];
}

const asObject = (params: URLSearchParams) => {
  return Object.fromEntries(params.entries());
};
