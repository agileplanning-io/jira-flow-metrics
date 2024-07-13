import { ReactElement } from "react";
import { CompletedIssue, Issue } from "@agileplanning-io/flow-metrics";
import { ChartOptions } from "chart.js";
import { Scatter } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import "chartjs-plugin-datalabels";
import {
  AbsoluteInterval,
  excludeOutliersFromSeq,
  formatDate,
  Percentile,
} from "@agileplanning-io/flow-lib";
import { compareAsc, startOfDay } from "date-fns";
import { mergeDeep, sort, uniqBy } from "remeda";
import { ChartStyle, buildFontSpec } from "../util/style";
import { getAnnotationOptions } from "../util/annotations";

type ScatterplotProps = {
  issues: CompletedIssue[];
  percentiles?: Percentile[];
  range: AbsoluteInterval;
  showPercentileLabels: boolean;
  setSelectedIssues: (issues: Issue[]) => void;
  hideOutliers: boolean;
  options?: ChartOptions<"scatter">;
  style?: ChartStyle;
};

export const Scatterplot = ({
  issues,
  range,
  percentiles,
  showPercentileLabels,
  setSelectedIssues,
  hideOutliers,
  options: overrideOptions,
  style,
}: ScatterplotProps): ReactElement => {
  const font = buildFontSpec(style);

  const data = issues.map((issue) => ({
    x: issue.metrics.completed,
    y: issue.metrics.cycleTime,
  }));

  const maxYValue = hideOutliers ? getMaxYValue(issues) : undefined;

  const onClick: ChartOptions<"scatter">["onClick"] = (_, elements) => {
    if (elements.length) {
      const selectedIssues = elements.map((el) => issues[el.index]);
      setSelectedIssues(selectedIssues);
    }
  };

  const datasets = [
    {
      label: "Cycle Time",
      backgroundColor: "rgb(255, 99, 132)",
      data,
    },
  ];

  const annotation = getAnnotationOptions(
    percentiles,
    showPercentileLabels,
    font,
    "y",
    (p) => `${p.percentile.toString()}% (${p.value.toFixed(1)} days)`,
  );

  const minDate = range.start.toISOString();
  const maxDate = range.end.toISOString();

  const defaultOptions: ChartOptions<"scatter"> = {
    onClick,
    plugins: {
      annotation,
      datalabels: {
        display: false,
      },
      legend: {
        labels: {
          font,
        },
      },
      tooltip: {
        titleFont: font,
        bodyFont: font,
        callbacks: {
          title: (ctx) => {
            const dates = ctx.map(({ dataIndex }) =>
              startOfDay(issues[dataIndex].metrics.completed),
            );
            const uniqDates = sort(
              uniqBy(dates, (date: Date) => date.getTime()),
              compareAsc,
            );

            if (uniqDates.length === 1) {
              return formatDate(uniqDates[0]);
            }

            return `${formatDate(uniqDates[0])}-${formatDate(uniqDates[1])}`;
          },
          label: (ctx) => {
            const issue = issues[ctx.dataIndex];
            const description = `[${issue.key}: ${issue.summary}]`;
            return `Cycle Time: ${issue.metrics.cycleTime?.toFixed(
              1,
            )} ${description}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: maxYValue,
        ticks: {
          font,
        },
      },
      x: {
        type: "time",
        min: minDate,
        max: maxDate,
        time: {
          unit: "day",
        },
        title: {
          text: "Completion Date",
          display: true,
          font,
        },
        ticks: {
          font,
        },
      },
    },
  };

  const options: ChartOptions<"scatter"> = mergeDeep(
    defaultOptions,
    overrideOptions ?? {},
  );

  return <Scatter data={{ datasets }} options={options} />;
};

const getMaxYValue = (issues: CompletedIssue[]): number => {
  const filteredIssues = excludeOutliersFromSeq(
    issues,
    (issue) => issue.metrics.cycleTime,
  );
  const maxXValue = Math.max(
    ...filteredIssues.map((issue) => issue.metrics.cycleTime),
  );
  return Math.ceil(maxXValue);
};
