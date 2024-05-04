import { ReactElement } from "react";
import { Bar } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";
import { AnnotationOptions } from "chartjs-plugin-annotation";
import "chartjs-adapter-date-fns";
import { TimeUnit } from "@agileplanning-io/flow-lib";
import { Issue, ThroughputResult } from "@agileplanning-io/flow-metrics";
import { getColorForPercentile } from "../util/styles";
import { ChartStyle, buildFontSpec, defaultBarStyle } from "../style";

type ThroughputChartProps = {
  result: ThroughputResult;
  timeUnit: TimeUnit;
  setSelectedIssues: (issues: Issue[]) => void;
  style?: ChartStyle;
};

export const ThroughputChart = ({
  result,
  timeUnit,
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
          font,
        },
        scaleID: "y",
        value: p.value,
      };
      return [p.percentile.toString(), options];
    }),
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
      annotation: {
        annotations,
      },
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
