import { ReactElement } from "react";
import { Bar } from "react-chartjs-2";
import { ChartData, ChartOptions, Tooltip } from "chart.js";
import "chartjs-adapter-date-fns";
import { Issue, StartedIssue } from "@jbrunton/flow-metrics";
import { Percentile } from "@jbrunton/flow-charts";
import { AnnotationOptions } from "chartjs-plugin-annotation";
import { ellipsize } from "@jbrunton/flow-lib";

type AgeingWipChartProps = {
  issues: StartedIssue[];
  percentiles: Percentile[];
  showPercentileLabels: boolean;
  setSelectedIssues: (issues: Issue[]) => void;
};

Tooltip.positioners.custom = (_, eventPosition) => {
  return {
    x: eventPosition.x,
    y: eventPosition.y,
  };
};

export const AgeingWipChart = ({
  issues,
  percentiles,
  showPercentileLabels,
  setSelectedIssues,
}: AgeingWipChartProps): ReactElement => {
  const labels = issues.map((issue) => [
    issue.key,
    ellipsize(issue?.summary ?? ""),
  ]);

  const annotations = percentiles
    ? Object.fromEntries(
        percentiles.map((p) => {
          const options: AnnotationOptions = {
            type: "line",
            borderColor: getColorForPercentile(p.percentile),
            borderWidth: 1,
            borderDash: p.percentile < 95 ? [4, 4] : undefined,
            label: {
              backgroundColor: "#FFFFFF",
              padding: 4,
              position: "start",
              yAdjust: -10,
              content: `${p.percentile.toString()}% (${p.cycleTime.toFixed(
                1,
              )} days)`,
              display: showPercentileLabels,
              textAlign: "start",
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
            scaleID: "x",
            value: p.cycleTime,
          };
          return [p.percentile.toString(), options];
        }),
      )
    : undefined;

  const data: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: "Age",
        data: issues.map(({ metrics }) => metrics.age ?? null),
        backgroundColor: (ctx) => {
          const issue = issues[ctx.dataIndex];
          const percentile = percentiles.find(
            (p) => issue.metrics.age >= p.cycleTime,
          )?.percentile;
          return getColorForPercentile(percentile ?? 0);
        },
        borderColor: "rgb(255, 99, 132)",
      },
    ],
  };

  const onClick: ChartOptions<"bar">["onClick"] = (_, elements) => {
    if (elements.length === 1) {
      const selectedIssues = elements.map((el) => issues[el.index]);
      setSelectedIssues(selectedIssues);
    } else {
      setSelectedIssues([]);
    }
  };

  const options: ChartOptions<"bar"> = {
    onClick,
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0,
    },
    layout: {
      padding: {
        top: 10,
      },
    },
    indexAxis: "y",
    plugins: {
      datalabels: {
        display: false,
      },
      annotation: {
        annotations,
        clip: false,
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            const issue = issues[items[0].dataIndex];
            return `${issue.key}: ${issue.summary}`;
          },
        },
        position: "custom",
      },
    },
  };

  return (
    <div style={{ height: issues.length * 30 + 120, marginBottom: 8 }}>
      <Bar data={data} options={options} />
    </div>
  );
};

const getColorForPercentile = (percentile: number): string => {
  if (percentile <= 50) {
    return "#03a9f4";
  }

  if (percentile <= 70) {
    return "#ff9800";
  }

  return "#f44336";
};
