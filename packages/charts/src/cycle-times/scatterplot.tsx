import { CSSProperties, ReactElement } from "react";
import { CompletedIssue, Issue } from "@agileplanning-io/flow-metrics";
import { ChartOptions } from "chart.js";
import { Scatter } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import "chartjs-plugin-datalabels";
import {
  excludeOutliersFromSeq,
  formatDate,
  Interval,
  Percentile,
} from "@agileplanning-io/flow-lib";
import { compareAsc, startOfDay } from "date-fns";
import { mergeDeep, sort, uniqBy } from "remeda";
import { AnnotationOptions } from "chartjs-plugin-annotation";
import { getColorForPercentile } from "./percentiles";

type ScatterplotProps = {
  issues: CompletedIssue[];
  percentiles?: Percentile[];
  range: Interval;
  showPercentileLabels: boolean;
  setSelectedIssues: (issues: Issue[]) => void;
  hideOutliers: boolean;
  options?: ChartOptions<"scatter">;
  style?: CSSProperties;
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
            scaleID: "y",
            value: p.value,
          };
          return [p.percentile.toString(), options];
        }),
      )
    : undefined;

  const minDate = range.start.toISOString();
  const maxDate = range.end.toISOString();

  const defaultOptions: ChartOptions<"scatter"> = {
    onClick,
    plugins: {
      annotation: {
        annotations,
      },
      datalabels: {
        display: false,
      },
      tooltip: {
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
            return `Age: ${issue.metrics.cycleTime?.toFixed(1)} ${description}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: maxYValue,
      },
      x: {
        type: "time",
        min: minDate,
        max: maxDate,
        time: {
          unit: "day",
        },
      },
    },
  };

  const options: ChartOptions<"scatter"> = mergeDeep(
    defaultOptions,
    overrideOptions ?? {},
  );

  return <Scatter data={{ datasets }} options={options} style={style} />;
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
