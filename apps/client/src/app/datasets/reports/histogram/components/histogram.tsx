import { Percentile } from "@jbrunton/flow-charts";
import { CompletedFlowMetrics, CompletedIssue } from "@jbrunton/flow-metrics";
import { ChartData, ChartOptions } from "chart.js";
import { AnnotationOptions } from "chartjs-plugin-annotation";
import { range, count } from "rambda";
import { FC, ReactElement } from "react";
import { Bar } from "react-chartjs-2";

export type HistogramProps = {
  issues: CompletedIssue[];
  setSelectedIssues: (issues: CompletedIssue[]) => void;
  percentiles?: Percentile[];
  showPercentileLabels: boolean;
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
  percentiles,
  showPercentileLabels,
  setSelectedIssues,
}): ReactElement => {
  const bucketedIssues: BucketedIssue[] = issues.map(bucketIssue);
  const buckets = range(
    0,
    Math.max(...bucketedIssues.map(({ metrics }) => metrics.bucket)) + 1,
  );
  const counts = buckets.map((bucket) =>
    count(({ metrics }) => bucket === metrics.bucket, bucketedIssues),
  );

  const data: ChartData<"bar"> = {
    labels: buckets,
    datasets: [
      {
        label: "Item Count",
        data: counts,
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
    <Bar
      data={data}
      options={{
        onClick,
        plugins: {
          datalabels: {
            display: false,
          },
          annotation: {
            annotations,
          },
          tooltip: {
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

const getColorForPercentile = (percentile: number): string => {
  if (percentile <= 50) {
    return "#03a9f4";
  }

  if (percentile <= 70) {
    return "#ff9800";
  }

  return "#f44336";
};
