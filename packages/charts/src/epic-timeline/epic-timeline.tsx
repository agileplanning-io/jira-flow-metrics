import { Tooltip, ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { Issue } from "@agileplanning-io/flow-metrics";
import { FC, useMemo } from "react";
import { ellipsize, formatDate } from "@agileplanning-io/flow-lib";
import { compact, sortBy, times, uniq } from "remeda";
import { TimelineEvent, getTimelineEvents } from "./timeline-events";

const statusCategoryColors = {
  "To Do": "#ddd",
  "In Progress": "#c2d5f7",
  Done: "#d4e7cd",
};

Tooltip.positioners.custom = (_, eventPosition) => {
  return {
    x: eventPosition.x,
    y: eventPosition.y,
  };
};

const getOptions = (
  issues: Issue[],
  testData: TimelineEvent[],
  setSelectedIssue: (issue: Issue) => void,
) => {
  const groups = uniq(testData.map((event) => event.issueKey));

  const labels = sortBy(groups, (group) =>
    Math.min(
      ...testData
        .filter((e) => e.issueKey === group)
        .map((event) => event.start.getTime()),
    ),
  );

  const sortedIssues = compact(
    labels.map((key) => issues.find((issue) => issue.key === key)),
  );

  const datasets = testData.map((event) => {
    const datasetIndex = labels.indexOf(event.issueKey);

    const data: (null | [number, number, string])[] = times(
      labels.length,
      (index) => {
        if (index !== datasetIndex) {
          return null;
        }

        const tooltipDates = event.isCompletedStatus
          ? formatDate(event.start)
          : `${formatDate(event.start)}-${formatDate(event.end)}`;
        const tooltipLabel = `${event.status} (${tooltipDates})`;

        return [event.startTime, event.endTime, tooltipLabel];
      },
    );

    return {
      summary: `${event.issueKey}: ${event.summary}`,
      data: data,
      skipNull: true,
      backgroundColor: statusCategoryColors[event.category],
      stack: event.issueKey,
      datalabels: {
        formatter: () => event.status,
      },
    };
  });

  const data = {
    labels: labels.map((key) => {
      const issue = issues.find((i) => i.key === key);
      return [key, ellipsize(issue?.summary ?? "")];
    }),
    datasets,
  };

  const onClick: ChartOptions<"bar">["onClick"] = (_, elements) => {
    if (elements.length) {
      const selectedIssue = sortedIssues[elements[0].index];
      setSelectedIssue(selectedIssue);
    }
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "y" as const,
    onClick,
    plugins: {
      tooltip: {
        callbacks: {
          title: (items) => data.datasets[items[0].datasetIndex].summary,
          label: (item) =>
            data.datasets[item.datasetIndex].data[item.dataIndex]?.[2],
          afterLabel: (item) => {
            const issue = issues[item.dataIndex];
            return `Issue Type: ${issue.issueType}`;
          },
        },
        position: "custom",
      },
      legend: {
        display: false,
      },
      datalabels: {
        color: "black",
        anchor: "start",
        align: "right",
        display: (context) => {
          return context.dataset.data[context.dataIndex] !== null
            ? "auto"
            : false;
        },
      },
    },
    resizeDelay: 20,
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0,
    },
    scales: {
      x: {
        min: Math.min(...testData.map((event) => event.start.getTime())),
        max: Math.max(...testData.map((event) => event.end.getTime())),
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
        type: "time",
        time: {
          unit: "day",
        },
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };
  return { options, data };
};

export type EpicTimelineProps = {
  epic: Issue;
  issues: Issue[];
  setSelectedIssue: (issue: Issue) => void;
};

export const EpicTimeline: FC<EpicTimelineProps> = ({
  epic,
  issues,
  setSelectedIssue,
}: EpicTimelineProps) => {
  const timelineEvents = useMemo(
    () => getTimelineEvents(epic, issues),
    [epic, issues],
  );

  const { options, data } = getOptions(
    issues,
    timelineEvents,
    setSelectedIssue,
  );

  return (
    <div style={{ height: issues.length * 30 + 120, marginBottom: 8 }}>
      <Bar options={options} data={data} />
    </div>
  );
};
