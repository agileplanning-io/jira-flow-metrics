import { Issue, IssueFlowMetrics } from "@agileplanning-io/flow-metrics";
import {
  Checkbox,
  Space,
  Table,
  TableProps,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  Percentile,
  formatDate,
  formatNumber,
} from "@agileplanning-io/flow-lib";
import { compareAsc, differenceInMinutes } from "date-fns";
import { ColumnType, ColumnsType, SortOrder } from "antd/es/table/interface";
import { FC, useEffect, useState } from "react";
import { isNullish, sortBy } from "remeda";

import { QuestionCircleOutlined, ZoomInOutlined } from "@ant-design/icons";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { IssueResolution, IssueStatus } from "./issue-fields";
import { IssueExternalLinkComponent, IssueLinkComponent } from "./issue-links";

export type SortState = {
  columnKey: "created" | "started" | "completed" | "cycleTime" | undefined;
  sortOrder: SortOrder;
};

type IssueDetailsDrawerProps = {
  selectedIssues: Issue[];
  onClose: () => void;
  open: boolean;
};

export type IssueDetailsDrawerComponent = FC<IssueDetailsDrawerProps>;

export type IssuesTableProps = {
  issues: Issue[];
  parentEpic?: Issue;
  defaultSortField: "created" | "started" | "cycleTime" | undefined;
  sortState?: SortState;
  onSortStateChanged?: (sortState: SortState) => void;
  onExcludedIssuesChanged?: (excludedIssueKeys: string[]) => void;
  defaultExcludedIssueKeys?: string[];
  percentiles?: Percentile[];
  flowMetricsOnly?: boolean;
  getIssuePath: (issueKey: string) => string;
  IssueLink: IssueLinkComponent;
  IssueExternalLink: IssueExternalLinkComponent;
  IssueDetailsDrawer: IssueDetailsDrawerComponent;
  footer?: TableProps<Issue>["footer"];
};

export const IssuesTable: React.FC<IssuesTableProps> = ({
  issues,
  getIssuePath,
  parentEpic,
  defaultSortField,
  sortState,
  onSortStateChanged,
  onExcludedIssuesChanged,
  defaultExcludedIssueKeys,
  percentiles,
  flowMetricsOnly,
  IssueLink,
  IssueExternalLink,
  IssueDetailsDrawer,
  footer,
}) => {
  const [excludedIssueKeys, setExcludedIssueKeys] = useState<string[]>(
    defaultExcludedIssueKeys ?? [],
  );

  const sortedPercentiles = percentiles
    ? sortBy(percentiles, (percentile) => -percentile.percentile)
    : undefined;

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const onSelectIssueChanged = (key: string, checked: boolean) => {
    const includeIssue = () =>
      setExcludedIssueKeys(excludedIssueKeys.filter((k) => k !== key));
    const excludeIssue = () =>
      setExcludedIssueKeys([...excludedIssueKeys, key]);

    const excluded = excludedIssueKeys.includes(key);
    if (checked && excluded) {
      includeIssue();
    } else if (!checked && !excluded) {
      excludeIssue();
    }
  };

  const [indeterminate, setIndeterminate] = useState(true);
  const [allChecked, setAllChecked] = useState(false);

  const onSelectAllChanged = () => {
    if (allChecked) {
      setExcludedIssueKeys(issues.map((issue) => issue.key));
    } else {
      setExcludedIssueKeys([]);
    }
  };

  useEffect(() => {
    const allChecked = excludedIssueKeys.length < issues.length;
    const indeterminate = allChecked && excludedIssueKeys.length > 0;
    setAllChecked(allChecked);
    setIndeterminate(indeterminate);
    onExcludedIssuesChanged?.(excludedIssueKeys);
  }, [excludedIssueKeys, issues, onExcludedIssuesChanged]);

  const configureSort = (column: ColumnType<Issue>): ColumnType<Issue> => {
    const key = column.key as string;

    const defaultSortOrders: Record<string, SortOrder> = {
      created: "ascend",
      started: "ascend",
      cycleTime: "descend",
    };

    const sortConfig: ColumnType<Issue> = {
      defaultSortOrder:
        defaultSortField === key ? defaultSortOrders[key] : undefined,
    };

    if (sortState) {
      sortConfig.sortOrder =
        sortState.columnKey === key ? sortState.sortOrder : undefined;
    }

    return { ...sortConfig, ...column };
  };

  const columns: ColumnsType<Issue> = [
    {
      title: "Key",
      key: "key",
      render: (_, issue) => {
        const path = getIssuePath(issue.key);
        return <IssueLink text={issue.key} path={path} />;
      },
    },
    {
      key: "open",
      render: (_, issue) => (
        <Space>
          <IssueExternalLink externalUrl={issue.externalUrl} />
          <a onClick={() => setSelectedIssue(issue)}>
            <ZoomInOutlined />
          </a>
        </Space>
      ),
    },
    {
      title: "Summary",
      key: "summary",
      dataIndex: "summary",
      render: (summary) => (
        <Typography.Text
          style={{ maxWidth: flowMetricsOnly ? 200 : 300 }}
          ellipsis={{ tooltip: summary }}
        >
          {summary}
        </Typography.Text>
      ),
    },
    {
      title: "Issue Type",
      dataIndex: "issueType",
      key: "issueType",
    },
    {
      title: "Status",
      key: "status",
      render: (_, issue) => <IssueStatus {...issue} />,
    },
    configureSort({
      title: "Started",
      dataIndex: ["metrics", "started"],
      key: "started",
      render: (date) => {
        return formatDate(date);
      },
      sorter: (a, b, sortOrder) =>
        compareDates(a.metrics.started, b.metrics.started, sortOrder),
    }),
    configureSort({
      title: "Completed",
      dataIndex: ["metrics", "completed"],
      key: "completed",
      render: (date) => {
        return formatDate(date);
      },
      sorter: (a, b, sortOrder) =>
        compareDates(a.metrics.completed, b.metrics.completed, sortOrder),
    }),
    configureSort({
      title: "Cycle Time",
      dataIndex: ["metrics"],
      key: "cycleTime",
      render: (metrics: IssueFlowMetrics) => {
        const cycleTime = metrics.cycleTime ?? metrics.age;
        if (!sortedPercentiles) {
          return formatNumber(cycleTime);
        }
        const percentile = isNullish(cycleTime)
          ? undefined
          : sortedPercentiles.find((p) => cycleTime >= p.value)?.percentile;
        const color = getPercentileColor(percentile);
        return (
          <Space direction="horizontal" style={{ float: "right" }}>
            {formatNumber(cycleTime)}
            <Tag
              style={{
                borderStyle: percentile !== undefined ? "solid" : "dashed",
              }}
              color={color}
            >
              {percentile ? `≥ p${percentile}` : "< p50"}
            </Tag>
          </Space>
        );
      },
      sorter: (a, b, sortOrder) =>
        compareNumbers(
          a.metrics.cycleTime ?? a.metrics.age,
          b.metrics.cycleTime ?? b.metrics.age,
          sortOrder,
        ),
    }),
    {
      title: "Resolution",
      key: "resolution",
      render: (_, issue) => <IssueResolution {...issue} />,
    },
    configureSort({
      title: "Created",
      dataIndex: ["created"],
      key: "created",
      render: (date) => {
        return formatDate(date);
      },
      sorter: (a, b, sortOrder) =>
        compareDates(a.created, b.created, sortOrder),
    }),
    {
      title: "Assignee",
      key: "assignee",
      render: (_, issue) => (
        <span style={{ whiteSpace: "nowrap" }}>{issue.assignee}</span>
      ),
    },
  ];

  if (onExcludedIssuesChanged) {
    const selectColumn: ColumnType<Issue> = {
      title: () => {
        return (
          <Checkbox
            indeterminate={indeterminate}
            checked={allChecked}
            onChange={onSelectAllChanged}
          />
        );
      },
      render: (issue: Issue) => {
        const included = !excludedIssueKeys.includes(issue.key);

        const tooltip = included
          ? `Uncheck to exclude from chart`
          : `Check to include in chart`;

        const onCheckboxChanged = (event: CheckboxChangeEvent) =>
          onSelectIssueChanged(issue.key, event.target.checked);

        return (
          <Tooltip placement="right" title={tooltip}>
            <Checkbox checked={included} onChange={onCheckboxChanged} />
          </Tooltip>
        );
      },
      width: "46px",
    };
    columns.unshift(selectColumn);
  }

  const IssueProgress = ({ issue }: { issue: Issue }) => {
    if (!parentEpic) return null;

    if (!issue.metrics.includedInEpic) {
      return (
        <Tooltip title="Excluded from epic metrics by project filters">
          N/A <QuestionCircleOutlined />
        </Tooltip>
      );
    }

    const parentStarted = parentEpic.metrics.started;
    if (!parentStarted) return null;

    const parentCompleted = parentEpic.metrics.completed ?? new Date();

    const issueStarted = issue.metrics.started;
    const issueCompleted = issue.metrics.completed;

    if (!issueStarted || !issueCompleted) return null;

    const totalDuration = differenceInMinutes(parentCompleted, parentStarted);
    const startedTime = differenceInMinutes(issueStarted, parentStarted);
    const completedTime = differenceInMinutes(issueCompleted, parentStarted);
    const progressTime = differenceInMinutes(issueCompleted, issueStarted);

    const startedIndex = (startedTime / totalDuration) * 100;
    const completedIndex = (completedTime / totalDuration) * 100;
    const progressWidth = (progressTime / totalDuration) * 100;

    return (
      <div
        style={{
          width: progressWidth,
          borderRadius: "10px",
          backgroundColor: "#1677ff",
          height: "10px",
          marginLeft: startedIndex,
          marginRight: 100 - completedIndex,
        }}
      />
    );
  };

  const spliceIndex =
    columns.findIndex((column) => column.key === "cycleTime") + 1;
  if (parentEpic) {
    columns.splice(spliceIndex, 0, {
      title: "Progress",
      key: "progress",
      render: (_, issue) => {
        return <IssueProgress issue={issue} />;
      },
    });
  } else {
    columns.splice(spliceIndex, 0, {
      title: "Parent",
      key: "parent",
      render: (_, issue) => {
        const parent = issue.parent;
        if (!parent) {
          return null;
        }
        const path = getIssuePath(issue.key);
        return (
          <Space>
            <a onClick={() => setSelectedIssue(parent)}>
              <ZoomInOutlined />
            </a>
            <IssueLink text={parent.summary} path={path} tag />
          </Space>
        );
      },
    });
  }

  const [pageSize, setPageSize] = useState(flowMetricsOnly ? 20 : 10);

  return (
    <>
      <Table
        dataSource={issues}
        size="small"
        scroll={{ x: flowMetricsOnly ? undefined : 1440 }}
        columns={columns.filter((column) =>
          flowMetricsOnly
            ? [
                "key",
                "open",
                "summary",
                "started",
                "completed",
                "cycleTime",
                "progress",
              ].includes(column.key as string)
            : true,
        )}
        rowClassName={(issue) =>
          parentEpic && !issue.metrics.includedInEpic ? "excluded" : "included"
        }
        onChange={(_pagination, _filters, sorter) => {
          if ("columnKey" in sorter) {
            const sortState = {
              columnKey: sorter.columnKey,
              sortOrder: sorter.order,
            } as SortState;
            onSortStateChanged?.(sortState);
          }
        }}
        pagination={{
          pageSize,
          showSizeChanger: true,
          onChange: (_, pageSize) => setPageSize(pageSize),
        }}
        footer={footer}
      />
      <IssueDetailsDrawer
        selectedIssues={selectedIssue ? [selectedIssue] : []}
        onClose={() => setSelectedIssue(null)}
        open={selectedIssue !== null}
      />
    </>
  );
};

const compareDates = (
  left: Date | undefined,
  right: Date | undefined,
  sortOrder: SortOrder | undefined,
) => {
  if (left && right) {
    return compareAsc(left, right);
  }

  if (left) {
    return sortOrder === "ascend" ? -1 : 1;
  }

  if (right) {
    return sortOrder === "ascend" ? 1 : -1;
  }

  return 0;
};

const compareNumbers = (
  left: number | undefined,
  right: number | undefined,
  sortOrder: SortOrder | undefined,
) => {
  if (left !== undefined && right !== undefined) {
    return left - right;
  }

  if (left !== undefined) {
    return sortOrder === "ascend" ? -1 : 1;
  }

  if (right !== undefined) {
    return sortOrder === "ascend" ? 1 : -1;
  }

  return 0;
};

const percentileThresholds = [
  { threshold: 95, color: "rgb(244, 67, 54)" },
  { threshold: 85, color: "red" },
  { threshold: 70, color: "orange" },
];

const getPercentileColor = (percentile: number | undefined) => {
  if (percentile === undefined) {
    return "blue";
  }

  const threshold = percentileThresholds.find(
    ({ threshold }) => percentile >= threshold,
  );

  return threshold?.color ?? "blue";
};
