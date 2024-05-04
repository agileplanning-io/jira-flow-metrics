import { Percentile } from "@agileplanning-io/flow-lib";
import {
  AnnotationOptions,
  AnnotationPluginOptions,
  LineAnnotationOptions,
} from "chartjs-plugin-annotation";
import { getColorForPercentile } from "./style";
import { FontSpec } from "chart.js";

export const getAnnotationOptions = (
  percentiles: Percentile[] | undefined,
  showPercentileLabels: boolean,
  font: Partial<FontSpec>,
  scaleID: LineAnnotationOptions["scaleID"],
  content: (p: Percentile) => string,
): AnnotationPluginOptions | undefined => {
  if (!percentiles) {
    return undefined;
  }

  const annotations = Object.fromEntries(
    percentiles.map((p) => {
      const options: AnnotationOptions = {
        type: "line",
        borderColor: getColorForPercentile(p.percentile),
        borderWidth: 1,
        borderDash: p.percentile < 95 ? [4, 4] : undefined,
        backgroundShadowColor: "#000000",
        borderShadowColor: "#FFFFFF90",
        shadowOffsetX: 1,
        shadowOffsetY: 1,
        label: {
          backgroundColor: "#FFFFFFA0",
          padding: 4,
          position: "start",
          xAdjust: scaleID === "x" ? 13 : 0,
          rotation: scaleID === "x" ? -90 : 0,
          content: content(p),
          display: showPercentileLabels,
          textAlign: "start",
          font,
          color: "#666666",
        },
        enter({ element }) {
          element.label!.options.display = true;
          return true;
        },
        leave({ element }) {
          element.label!.options.display = showPercentileLabels;
          return true;
        },
        scaleID,
        value: p.value,
      };
      return [p.percentile.toString(), options];
    }),
  );

  return { annotations, clip: false };
};
