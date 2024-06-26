import { Percentile, excludeOutliersFromSeq } from "@agileplanning-io/flow-lib";
import {
  CompletedFlowMetrics,
  CompletedIssue,
} from "@agileplanning-io/flow-metrics";
import { ChartData, ChartOptions } from "chart.js";
import { cumsum } from "mathjs";
import { range, countBy, mergeDeep } from "remeda";
import { FC, ReactElement } from "react";
import { Chart } from "react-chartjs-2";
import { ChartStyle, buildFontSpec, defaultBarStyle } from "../util/style";
import { getAnnotationOptions } from "../util/annotations";

export type HistogramProps = {
  issues: CompletedIssue[];
  setSelectedIssues: (issues: CompletedIssue[]) => void;
  percentiles?: Percentile[];
  showPercentileLabels: boolean;
  hideOutliers: boolean;
  style?: ChartStyle;
  options?: ChartOptions<"bar" | "line">;
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
  style,
  options: overrideOptions,
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

  const font = buildFontSpec(style);

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
        yAxisID: "y",
        ...defaultBarStyle,
      },
    ],
  };

  const annotation = getAnnotationOptions(
    percentiles,
    showPercentileLabels,
    font,
    "x",
    (p) => `${p.percentile.toString()}% (${p.value.toFixed(1)} days)`,
  );

  const onClick: ChartOptions<"bar">["onClick"] = (_, elements) => {
    if (elements.length) {
      const selectedBuckets = elements.map((el) => buckets[el.index]);
      const selectedIssues = bucketedIssues.filter(({ metrics }) =>
        selectedBuckets.includes(metrics.bucket),
      );
      setSelectedIssues(selectedIssues);
    }
  };

  const defaultOptions: ChartOptions<"bar"> = {
    onClick,
    scales: {
      x: {
        max: maxXValue,
        title: {
          text: "Cycle Time (days)",
          display: true,
          font,
        },
        ticks: {
          font,
        },
      },
      y: {
        position: "left",
        ticks: {
          font,
        },
      },
      y2: {
        position: "right",
        ticks: {
          font,
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      datalabels: {
        display: false,
      },
      annotation,
      legend: {
        labels: {
          font,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        position: "nearest",
        callbacks: {
          title: () => "",
          label: (item) => {
            const isCumulative = item.datasetIndex === 0;
            const count = item.parsed.y as number;
            const bucket = item.parsed.x as number;
            const percent = ((count / issues.length) * 100).toFixed(1);
            const description = isCumulative ? `within` : `in exactly`;
            return `${count} (${percent}%) items completed ${description} ${bucket} days`;
          },
        },
        bodyFont: font,
      },
    },
  };

  const options: ChartOptions<"bar" | "line"> = mergeDeep(
    defaultOptions,
    overrideOptions ?? {},
  );

  return <Chart type="bar" data={data} options={options} />;
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
