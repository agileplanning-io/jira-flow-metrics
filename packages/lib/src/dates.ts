import { addSeconds, differenceInSeconds } from "date-fns";

const secondsInDay = 60 * 60 * 24;

export const getDifferenceInDays = (left: Date, right: Date): number =>
  differenceInSeconds(left, right) / secondsInDay;

export const addDifferenceInDays = (
  date: Date,
  differenceInDays: number,
): Date => addSeconds(date, differenceInDays * secondsInDay);
