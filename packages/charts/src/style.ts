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
