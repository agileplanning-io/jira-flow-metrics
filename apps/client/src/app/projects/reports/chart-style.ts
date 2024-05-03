import { ChartStyle } from "@agileplanning-io/flow-charts";
import { atom } from "jotai";

export enum FontSize {
  Default = 12,
  Large = 16,
}

export const fontSizeAtom = atom(FontSize.Default);

export const chartStyleAtom = atom((get) => {
  const fontSize = get(fontSizeAtom);
  const chartStyle: ChartStyle = {
    fontSize,
  };
  return chartStyle;
});
