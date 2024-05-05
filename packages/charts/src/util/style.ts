import { FontSpec } from "chart.js";

export type ChartStyle = {
  fontSize: number;
};

const defaultStyle: ChartStyle = {
  fontSize: 12,
};

export const buildFontSpec = (style?: ChartStyle): Partial<FontSpec> => {
  const fontSize = style?.fontSize ?? defaultStyle.fontSize;
  const font = {
    size: fontSize,
  };
  return font;
};

export const defaultBarStyle = Object.freeze({
  backgroundColor: "#0E7EF1",
  barPercentage: 1,
  categoryPercentage: 0.9,
});

export const getColorForPercentile = (percentile: number): string => {
  if (percentile <= 50) {
    return "#03a9f4";
  }

  if (percentile <= 70) {
    return "#ff9800";
  }

  return "#f44336";
};
