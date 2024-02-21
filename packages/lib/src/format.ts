import { format } from "date-fns";
import { isNil } from "remeda";

export const formatNumber = (x?: number): string | undefined => {
  if (!isNil(x)) {
    return x.toFixed(1);
  }
};

export const formatDate = (
  date?: Date,
  now = new Date(),
): string | undefined => {
  if (date) {
    const sameYear = date.getFullYear() === now.getFullYear();
    return sameYear ? format(date, "d MMM") : format(date, "d MMM yyyy");
  }
};

export const formatTime = (date?: Date): string | undefined => {
  if (date) {
    return format(date, "PPp");
  }
};

export const ellipsize = (text: string, maxLength = 32) =>
  text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
