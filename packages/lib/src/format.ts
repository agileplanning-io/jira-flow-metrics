import { format } from "date-fns";
import { isNil } from "remeda";
import { AbsoluteInterval } from "./intervals";

export const formatNumber = (x?: number): string | undefined => {
  if (!isNil(x)) {
    return x.toFixed(1);
  }
};

export const formatDate = (
  date?: Date,
  alwaysIncludeYear = false,
): string | undefined => {
  if (date) {
    const now = new Date();
    return !alwaysIncludeYear && isSameYear(date, now)
      ? format(date, "d MMM")
      : format(date, "d MMM yyyy");
  }
};

export const formatInterval = (interval: AbsoluteInterval) => {
  const alwaysIncludeYear = !isSameYear(interval.start, interval.end);
  return `${formatDate(interval.start, alwaysIncludeYear)}-${formatDate(
    interval.end,
    alwaysIncludeYear,
  )}`;
};

export const formatTime = (date?: Date): string | undefined => {
  if (date) {
    return format(date, "PPp");
  }
};

export const ellipsize = (text: string, maxLength = 32) =>
  text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;

const isSameYear = (date1: Date, date2: Date) =>
  date1.getFullYear() === date2.getFullYear();
