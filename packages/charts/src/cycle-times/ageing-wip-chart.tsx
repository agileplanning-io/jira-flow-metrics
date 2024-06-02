import { ReactElement } from "react";
import { Bar } from "react-chartjs-2";
import { ChartData, ChartOptions, ScriptableContext, Tooltip } from "chart.js";
import "chartjs-adapter-date-fns";
import { Issue, StartedIssue } from "@agileplanning-io/flow-metrics";
import { ellipsize, Percentile } from "@agileplanning-io/flow-lib";
import { ChartStyle, buildFontSpec } from "../util/style";
import { getAnnotationOptions } from "../util/annotations";
import { mergeDeep } from "remeda";

type AgeingWipChartProps = {
  issues: StartedIssue[];
  percentiles: Percentile[];
  showPercentileLabels: boolean;
  setSelectedIssues: (issues: Issue[]) => void;
  style?: ChartStyle;
  options?: ChartOptions<"bar">;
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
  style,
  options: overrideOptions,
}: AgeingWipChartProps): ReactElement => {
  const labels = issues.map((issue) => [
    issue.key,
    ellipsize(issue?.summary ?? ""),
  ]);

  const font = buildFontSpec(style);

  const annotation = getAnnotationOptions(
    percentiles,
    showPercentileLabels,
    font,
    "x",
    (p) => `${p.percentile.toString()}% (${p.value.toFixed(1)} days)`,
  );

  const data: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: "Age",
        data: issues.map(({ metrics }) => metrics.age ?? null),
        backgroundColor: (ctx: ScriptableContext<"bar">) => {
          const issue = issues[ctx.dataIndex];
          const percentile = issue
            ? percentiles.find((p) => issue.metrics.age >= p.value)?.percentile
            : 0;
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

  const defaultOptions: ChartOptions<"bar"> = {
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
          font,
          display: true,
        },
        ticks: {
          font,
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
      legend: {
        labels: {
          font,
        },
      },
      annotation,
      tooltip: {
        titleFont: font,
        bodyFont: font,
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

  const options = mergeDeep(defaultOptions, overrideOptions ?? {});

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
