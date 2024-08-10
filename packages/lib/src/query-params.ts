import { format } from "date-fns";
import qs from "qs";

type ParsedObject = { [key: string]: unknown };

export const qsParse = (query: string): ParsedObject => {
  const parsedObject = qs.parse(query.toString(), {
    ignoreQueryPrefix: true,
    allowDots: true,
  });

  return parseBooleans(parsedObject);
};

const parseBooleans = (obj: object): ParsedObject => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (value === "true") return [key, true];
      if (value === "false") return [key, false];
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        return [key, parseBooleans(value)];
      }
      return [key, value];
    }),
  );
};

export const qsStringify = (obj: unknown) =>
  qs.stringify(obj, {
    skipNulls: true,
    serializeDate: (date: Date) => format(date, "yyyy-MM-dd"),
    allowDots: true,
    arrayFormat: "brackets",
  });
