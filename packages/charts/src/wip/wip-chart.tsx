import { ReactElement } from "react";
import { Line } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
import "chartjs-adapter-date-fns";
import { Issue, WipResult } from "@agileplanning-io/flow-metrics";
import { ChartStyle, buildFontSpec } from "../style";

type WipChartProps = {
  result: WipResult;
  setSelectedIssues: (issues: Issue[]) => void;
  style?: ChartStyle;
};

export const WipChart = ({
  result,
  setSelectedIssues,
  style,
}: WipChartProps): ReactElement => {
  const labels = result.map(({ date }) => date.toISOString());

  const data = {
    labels,
    datasets: [
      {
        label: "WIP",
        data: result.map(({ count }) => count),
        fill: false,
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
    ],
  };

  const font = buildFontSpec(style);

  const scales: ChartOptions<"line">["scales"] = {
    x: {
      type: "time",
      time: {
        unit: "day",
      },
      position: "bottom",
      ticks: { font },
    },
    y: {
      beginAtZero: true,
      ticks: { font },
    },
  };

  const onClick: ChartOptions<"line">["onClick"] = (_, elements) => {
    if (elements.length === 1) {
      const selectedIssues = elements.map((el) => result[el.index].issues)[0];
      setSelectedIssues(selectedIssues);
    } else {
      setSelectedIssues([]);
    }
  };

  const options: ChartOptions<"line"> = {
    onClick,
    scales,
    plugins: {
      datalabels: {
        display: false,
      },
      legend: {
        labels: { font },
      },
      tooltip: {
        bodyFont: font,
        titleFont: font,
      },
    },
  };

  return <Line data={data} options={options} />;
};
