import { ReactElement } from "react";
import { Bar } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";
import "chartjs-adapter-date-fns";
import { TimeUnit } from "@agileplanning-io/flow-lib";
import { Issue, ThroughputResult } from "@agileplanning-io/flow-metrics";
import { ChartStyle, buildFontSpec, defaultBarStyle } from "../util/style";
import { getAnnotationOptions } from "../util/annotations";

type ThroughputChartProps = {
  result: ThroughputResult;
  timeUnit: TimeUnit;
  showPercentileLabels: boolean;
  setSelectedIssues: (issues: Issue[]) => void;
  style?: ChartStyle;
};

export const ThroughputChart = ({
  result,
  timeUnit,
  showPercentileLabels,
  setSelectedIssues,
  style,
}: ThroughputChartProps): ReactElement => {
  const labels = result.data.map(({ date }) => date.toISOString());

  const font = buildFontSpec(style);

  const data: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: "Throughput",
        data: result.data.map(({ count }) => count),
        ...defaultBarStyle,
      },
    ],
  };

  const annotation = getAnnotationOptions(
    result.percentiles,
    showPercentileLabels,
    font,
    "y",
    (p) =>
      `${(100 - p.percentile).toString()}% (≤ ${p.value.toFixed(
        1,
      )} issues completed)`,
  );

  const scales: ChartOptions<"bar">["scales"] = {
    x: {
      type: "time",
      time: {
        unit: timeUnit === TimeUnit.Fortnight ? "week" : timeUnit,
      },
      position: "bottom",
      ticks: {
        font,
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        font,
      },
    },
  };

  const onClick: ChartOptions<"bar">["onClick"] = (_, elements) => {
    if (elements.length === 1) {
      const selectedIssues = elements.map(
        (el) => result.data[el.index].issues,
      )[0];
      setSelectedIssues(selectedIssues);
    } else {
      setSelectedIssues([]);
    }
  };

  const options: ChartOptions<"bar"> = {
    onClick,
    scales,
    plugins: {
      annotation,
      datalabels: {
        display: false,
      },
      title: { font },
      tooltip: {
        bodyFont: font,
        titleFont: font,
      },
      legend: {
        labels: { font },
      },
    },
  };

  return <Bar data={data} options={options} style={{ marginTop: 40 }} />;
};
