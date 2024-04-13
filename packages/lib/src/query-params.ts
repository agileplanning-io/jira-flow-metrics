import { format, parse } from "date-fns";
import qs from "qs";

const makeDecoder = () => {
  let isArray = false;
  return (
    str: string,
    defaultDecoder: qs.defaultDecoder,
    charset: string,
    type: "key" | "value",
  ) => {
    if (type === "value") {
      if (!isArray) {
        if (str === "true") {
          return true;
        } else if (str === "false") {
          return false;
        }

        if (str.match(/\d{4}-\d{2}-\d{2}/)) {
          try {
            return parse(str, "yyyy-MM-dd", new Date());
          } catch {
            // not a real date so assume it's intended to be a string
          }
        }
      } else {
        // if we're parsing an array value then fall through to default parser and reset state for
        // the next key/value pair
        isArray = false;
      }
    }
    if (type === "key" && str.includes("[]")) {
      isArray = true;
    }
    return defaultDecoder(str, defaultDecoder, charset);
  };
};

export const qsParse = (query: string) =>
  qs.parse(query.toString(), {
    ignoreQueryPrefix: true,
    allowDots: true,
    decoder: makeDecoder(),
  });

export const qsStringify = (obj: unknown) =>
  qs.stringify(obj, {
    skipNulls: true,
    serializeDate: (date: Date) => format(date, "yyyy-MM-dd"),
    allowDots: true,
    arrayFormat: "brackets",
  });
