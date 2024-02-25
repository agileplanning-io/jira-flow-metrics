import { ReactElement } from "react";
import { Line } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
import { AnnotationOptions } from "chartjs-plugin-annotation";
import "chartjs-adapter-date-fns";
import { ThroughputResult } from "@usecases/throughput/throughput";
import { TimeUnit } from "@agileplanning-io/flow-lib";
import { Issue } from "@agileplanning-io/flow-metrics";

type ThroughputChartProps = {
  result: ThroughputResult;
  timeUnit: TimeUnit;
  setSelectedIssues: (issues: Issue[]) => void;
};

export const ThroughputChart = ({
  result,
  timeUnit,
  setSelectedIssues,
}: ThroughputChartProps): ReactElement => {
  const labels = result.data.map(({ date }) => date.toISOString());

  const data = {
    labels,
    datasets: [
      {
        label: "Throughput",
        data: result.data.map(({ count }) => count),
        fill: false,
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
    ],
  };

  const annotations = Object.fromEntries(
    result.percentiles.map((p) => {
      const options: AnnotationOptions = {
        type: "line",
        borderColor: p.color,
        borderWidth: 1,
        borderDash: p.dashed ? [4, 4] : undefined,
        label: {
          backgroundColor: "#FFF",
          padding: 4,
          position: "start",
          content: `${p.percentile.toString()}%`,
          display: true,
          textAlign: "start",
          color: "#666666",
        },
        scaleID: "y",
        value: p.throughput,
      };
      return [p.percentile.toString(), options];
    }),
  );

  const scales: ChartOptions<"line">["scales"] = {
    x: {
      type: "time",
      time: {
        unit: timeUnit === TimeUnit.Fortnight ? "week" : timeUnit,
      },
      position: "bottom",
    },
    y: {
      beginAtZero: true,
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

  const options: ChartOptions<"line"> = {
    onClick,
    scales,
    plugins: {
      annotation: {
        annotations,
      },
      datalabels: {
        display: false,
      },
    },
  };

  return <Line data={data} options={options} style={{ marginTop: 40 }} />;
};
