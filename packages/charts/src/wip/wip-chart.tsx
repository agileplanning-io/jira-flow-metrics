import { ReactElement } from "react";
import { Line } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
import { AnnotationOptions } from "chartjs-plugin-annotation";
import "chartjs-adapter-date-fns";
import { Issue, WipResult } from "@agileplanning-io/flow-metrics";
import { getColorForPercentile } from "../util/styles";

type WipChartProps = {
  result: WipResult;
  setSelectedIssues: (issues: Issue[]) => void;
};

export const WipChart = ({
  result,
  setSelectedIssues,
}: WipChartProps): ReactElement => {
  const labels = result.data.map(({ date }) => date.toISOString());

  const data = {
    labels,
    datasets: [
      {
        label: "WIP",
        data: result.data.map(({ count }) => count),
        fill: false,
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
    ],
  };

  const scales: ChartOptions<"line">["scales"] = {
    x: {
      type: "time",
      time: {},
      ticks: {
        font: {
          size: 16,
        },
      },
      position: "bottom",
    },
    y: {
      beginAtZero: true,
      ticks: {
        font: {
          size: 16,
        },
      },
    },
  };

  const onClick: ChartOptions<"line">["onClick"] = (_, elements) => {
    if (elements.length === 1) {
      const selectedIssues = elements.map(
        (el) => result.data[el.index].issues,
      )[0];
      setSelectedIssues(selectedIssues);
    } else {
      setSelectedIssues([]);
    }
  };

  const annotations = Object.fromEntries(
    result.percentiles.map((p) => {
      const options: AnnotationOptions = {
        type: "line",
        borderColor: getColorForPercentile(p.percentile),
        borderWidth: 1,
        borderDash: ![15, 85].includes(p.percentile) ? [4, 4] : undefined,
        label: {
          backgroundColor: "#FFF",
          padding: 4,
          position: "start",
          content: `${(100 - p.percentile).toString()}%`,
          display: true,
          textAlign: "start",
          color: "#666666",
          font: {
            size: 16,
          },
        },
        scaleID: "y",
        value: p.value,
      };
      return [p.percentile.toString(), options];
    }),
  );

  const options: ChartOptions<"line"> = {
    onClick,
    scales,
    plugins: {
      datalabels: {
        display: false,
      },
      annotation: {
        annotations,
      },
    },
  };

  return <Line data={data} options={options} />;
};
