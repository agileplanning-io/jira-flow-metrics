import { format } from "date-fns";
import qs from "qs";

export const qsParse = (query: string): { [key: string]: unknown } =>
  qs.parse(query.toString(), {
    ignoreQueryPrefix: true,
    allowDots: true,
  });

export const qsStringify = (obj: unknown) =>
  qs.stringify(obj, {
    skipNulls: true,
    serializeDate: (date: Date) => format(date, "yyyy-MM-dd"),
    allowDots: true,
    arrayFormat: "brackets",
  });
