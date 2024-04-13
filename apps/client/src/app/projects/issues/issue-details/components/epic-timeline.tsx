import { Tooltip, ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { Issue, Transition } from "@agileplanning-io/flow-metrics";
import { FC, useEffect, useMemo, useState } from "react";
import { ellipsize, formatDate } from "@agileplanning-io/flow-lib";
import {
  dropWhile,
  equals,
  flatten,
  compact,
  sortBy,
  times,
  uniq,
} from "remeda";
import { addHours } from "date-fns";
import { IssueDetailsDrawer } from "@app/projects/reports/components/issue-details-drawer";
import { IssuesTable } from "@app/components/issues-table";

const statusCategoryColors = {
  "To Do": "#ddd",
  "In Progress": "#c2d5f7",
  Done: "#d4e7cd",
};

type TimelineEvent = {
  label: string;
  summary: string;
  issueKey: string;
  status: string;
  category: Issue["statusCategory"];
  start: Date;
  end: Date;
  startTime: number;
  endTime: number;
  isCompletedStatus: boolean;
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
};

const getTimelineEvents = (epic: Issue, issues: Issue[]): TimelineEvent[] => {
  const completedDate = epic.metrics?.completed;
  const now = new Date();
  const truncateBy = epic.metrics.cycleTime
    ? (epic.metrics.cycleTime / 20) * 24
    : 0;
  const truncateDate =
    completedDate && addHours(completedDate, truncateBy) < now
      ? addHours(completedDate, truncateBy)
      : undefined;

  const dropDoneStatuses = (
    transitions: Transition[],
    transition: Transition,
  ) => {
    // incomplete epic, don't drop any statuses
    if (!truncateDate) {
      return [...transitions, transition];
    }

    // status is before completed date, keep it
    if (transition.until < truncateDate) {
      return [...transitions, transition];
    }

    // status begins after it was completed, discard it
    if (transition.date > truncateDate) {
      return transitions;
    }

    // status spans the completed date, truncate it
    return [
      ...transitions,
      {
        ...transition,
        until: truncateDate,
      },
    ];
  };

  const mergeStatuses = (
    transitions: Transition[],
    transition: Transition,
    index: number,
  ) => {
    const prevTransition = index > 0 ? transitions[index - 1] : undefined;
    if (
      prevTransition &&
      equals(prevTransition.toStatus, transition.toStatus)
    ) {
      // merge adjacent transitions to the same status
      prevTransition.until = transition.until;
      return transitions;
    } else {
      return [...transitions, transition];
    }
  };

  const events = issues.map((issue) => {
    const transitions = dropWhile(
      issue.transitions,
      (t) => t.toStatus.category !== "In Progress",
    )
      .reduce<Transition[]>(mergeStatuses, [])
      .reduce<Transition[]>(dropDoneStatuses, []);

    const events = transitions.map((t, index) => {
      const prevTransition = index > 0 ? transitions[index - 1] : undefined;
      const startTime = prevTransition ? 0 : t.date.getTime();
      const endTime = prevTransition
        ? t.until.getTime() - t.date.getTime()
        : t.until.getTime();
      return {
        issueKey: issue.key,
        summary: issue.summary,
        start: t.date,
        end: t.until,
        startTime,
        endTime,
        status: t.toStatus.name,
        category: t.toStatus.category,
        isCompletedStatus:
          (issue.metrics.completed && index === transitions.length - 1) ??
          false,
        label: "", // TODO: when should this be computed?
      };
    });

    return events;
  });

  return flatten(events);
};

export const EpicTimeline: FC<EpicTimelineProps> = ({
  epic,
  issues,
}: EpicTimelineProps) => {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [excludedIssues, setExcludedIssues] = useState<string[]>([]);
  const [timelineIssues, setTimelineIssues] = useState<Issue[]>(issues);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  const defaultExcludedIssues = useMemo(() => {
    return issues
      .filter((issue) => !issue.metrics.includedInEpic)
      .map((issue) => issue.key);
  }, [issues]);

  useEffect(() => {
    const timelineIssues = issues.filter(
      (issue) =>
        !excludedIssues.includes(issue.key) &&
        issue.transitions.some((t) => t.toStatus.category === "In Progress"),
    );

    const events = getTimelineEvents(epic, timelineIssues);

    setTimelineIssues(timelineIssues);
    setTimelineEvents(events);
  }, [issues, excludedIssues, epic, setTimelineIssues]);

  const { options, data } = getOptions(
    timelineIssues,
    timelineEvents,
    setSelectedIssue,
  );
  return (
    <>
      <div
        style={{ height: timelineIssues.length * 30 + 120, marginBottom: 8 }}
      >
        <Bar options={options} data={data} />
      </div>
      <IssuesTable
        issues={issues.filter((issue) =>
          issue.transitions.some((t) => t.toStatus.category !== "In Progress"),
        )}
        defaultSortField="started"
        onExcludedIssuesChanged={setExcludedIssues}
        defaultExcludedIssueKeys={defaultExcludedIssues}
      />
      <IssueDetailsDrawer
        selectedIssues={selectedIssue ? [selectedIssue] : []}
        onClose={() => setSelectedIssue(null)}
        open={selectedIssue !== null}
      />
    </>
  );
};
