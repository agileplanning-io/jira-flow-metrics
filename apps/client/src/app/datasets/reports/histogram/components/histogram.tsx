import { CompletedFlowMetrics, CompletedIssue } from "@jbrunton/flow-metrics";
import { ChartData, ChartOptions } from "chart.js";
import { range, count } from "rambda";
import { FC, ReactElement } from "react";
import { Bar } from "react-chartjs-2";

export type HistogramProps = {
  issues: CompletedIssue[];
  setSelectedIssues: (issues: CompletedIssue[]) => void;
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
