import { Percentile, excludeOutliersFromSeq } from "@agileplanning-io/flow-lib";
import {
  CompletedFlowMetrics,
  CompletedIssue,
} from "@agileplanning-io/flow-metrics";
import { ChartData, ChartOptions } from "chart.js";
import { AnnotationOptions } from "chartjs-plugin-annotation";
import { cumsum } from "mathjs";
import { range, countBy } from "remeda";
import { FC, ReactElement } from "react";
import { Chart } from "react-chartjs-2";
import { getColorForPercentile } from "../util/styles";

export type HistogramProps = {
  issues: CompletedIssue[];
  setSelectedIssues: (issues: CompletedIssue[]) => void;
  percentiles?: Percentile[];
  showPercentileLabels: boolean;
  hideOutliers: boolean;
};

type BucketedFlowMetrics = CompletedFlowMetrics & {
  bucket: number;
};

type BucketedIssue = CompletedIssue & {
  metrics: BucketedFlowMetrics;
};

const bucketIssue = (issue: CompletedIssue): BucketedIssue => {
  const bucket = Math.ceil(issue.metrics.cycleTime);
  const metrics = {
    ...issue.metrics,
    bucket,
  };
  return {
    ...issue,
    metrics,
  };
};

export const Histogram: FC<HistogramProps> = ({
  issues,
  setSelectedIssues,
  percentiles,
  showPercentileLabels,
  hideOutliers,
}): ReactElement => {
  const bucketedIssues: BucketedIssue[] = issues.map(bucketIssue);
  const buckets = range(
    0,
    Math.max(...bucketedIssues.map(({ metrics }) => metrics.bucket)) + 1,
  );
  const counts = buckets.map((bucket) =>
    countBy(bucketedIssues, ({ metrics }) => bucket === metrics.bucket),
  );

  const cumulativeCounts = cumsum(counts) as number[];

  const maxXValue = hideOutliers ? getMaxXValue(issues) : undefined;

  const data: ChartData<"bar" | "line"> = {
    labels: buckets,
    datasets: [
      {
        label: "Cumulative",
        type: "line",
        yAxisID: "y2",
        backgroundColor: "#F1810E",
        borderColor: "#F1810E",
        data: cumulativeCounts,
      },
      {
        label: "Item Count",
        data: counts,
        backgroundColor: "#0E7EF1",
        barPercentage: 1,
        categoryPercentage: 0.9,
        yAxisID: "y",
      },
    ],
  };

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
              rotation: 90,
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

  const onClick: ChartOptions<"bar">["onClick"] = (_, elements) => {
    if (elements.length) {
      const selectedBuckets = elements.map((el) => buckets[el.index]);
      const selectedIssues = bucketedIssues.filter(({ metrics }) =>
        selectedBuckets.includes(metrics.bucket),
      );
      setSelectedIssues(selectedIssues);
    }
  };

  return (
    <Chart
      type="bar"
      data={data}
      options={{
        onClick,
        scales: {
          x: {
            max: maxXValue,
          },
          y: {
            position: "left",
          },
          y2: {
            position: "right",
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          datalabels: {
            display: false,
          },
          annotation: {
            annotations,
          },
          tooltip: {
            mode: "index",
            intersect: false,
            position: "nearest",
            callbacks: {
              title: () => "",
              label: (item) => {
                const count = item.parsed.y as number;
                const bucket = item.parsed.x as number;
                const percent = ((count / issues.length) * 100).toFixed(1);
                return `${count} (${percent}%) items completed in ${bucket} days`;
              },
            },
          },
        },
      }}
    />
  );
};

const getMaxXValue = (issues: CompletedIssue[]): number => {
  const filteredIssues = excludeOutliersFromSeq(
    issues,
    (issue) => issue.metrics.cycleTime,
  );
  const maxXValue = Math.max(
    ...filteredIssues.map((issue) => issue.metrics.cycleTime),
  );
  return Math.ceil(maxXValue);
};
