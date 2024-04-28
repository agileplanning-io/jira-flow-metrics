import { ReactElement } from "react";
import { Bar } from "react-chartjs-2";
import { ChartData, ChartOptions, ScriptableContext, Tooltip } from "chart.js";
import "chartjs-adapter-date-fns";
import { Issue, StartedIssue } from "@agileplanning-io/flow-metrics";
import { AnnotationOptions } from "chartjs-plugin-annotation";
import { ellipsize, Percentile } from "@agileplanning-io/flow-lib";

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
              content: `${p.percentile.toString()}% (${p.value.toFixed(
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
            value: p.value,
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
        backgroundColor: (ctx: ScriptableContext<"bar">) => {
          const issue = issues[ctx.dataIndex];
          const percentile = percentiles.find(
            (p) => issue.metrics.age >= p.value,
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
    scales: {
      x: {
        title: {
          text: "Issue age (days)",
          display: true,
        },
      },
      y: {
        ticks: {
          autoSkip: false,
        },
      },
    },
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
          afterLabel: (item) => {
            const issue = issues[item.dataIndex];
            return `Issue Type: ${issue.issueType}`;
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
