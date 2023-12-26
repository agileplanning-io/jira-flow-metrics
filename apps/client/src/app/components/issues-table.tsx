import { Issue } from "@jbrunton/flow-metrics";
import { Checkbox, Space, Table, Tag, Typography } from "antd";
import { formatDate, formatNumber } from "@jbrunton/flow-lib";
import { compareAsc, differenceInMinutes } from "date-fns";
import { ColumnType, ColumnsType, SortOrder } from "antd/es/table/interface";
import { useEffect, useState } from "react";
import { useNavigationContext } from "../navigation/context";
import { isNil } from "rambda";
import { Percentile } from "@usecases/scatterplot/cycle-times";
import {
  IssueExternalLink,
  IssueLink,
  IssueResolution,
  IssueStatus,
} from "@jbrunton/flow-components";
import { IssueDetailsDrawer } from "@app/datasets/reports/scatterplot/components/issue-details-drawer";
import { ZoomInOutlined } from "@ant-design/icons";
import { issueDetailsPath } from "@app/navigation/paths";

export type SortState = {
  columnKey: "created" | "started" | "completed" | "cycleTime" | undefined;
  sortOrder: SortOrder;
};

export type IssuesTableProps = {
  issues: Issue[];
  parentEpic?: Issue;
  defaultSortField: "created" | "started" | "cycleTime" | undefined;
  sortState?: SortState;
  onSortStateChanged?: (sortState: SortState) => void;
  onExcludedIssuesChanged?: (excludedIssueKeys: string[]) => void;
  percentiles?: Percentile[];
};

export const IssuesTable: React.FC<IssuesTableProps> = ({
  issues,
  parentEpic,
  defaultSortField,
  sortState,
  onSortStateChanged,
  onExcludedIssuesChanged,
  percentiles,
}) => {
  const { datasetId } = useNavigationContext();

  const [excludedIssueKeys, setExcludedIssueKeys] = useState<string[]>([]);

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
        const path = issueDetailsPath({ issueKey: issue.key, datasetId });
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
          style={{ maxWidth: 300 }}
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
      dataIndex: ["metrics", "cycleTime"],
      key: "cycleTime",
      render: (cycleTime) => {
        if (!percentiles) {
          return formatNumber(cycleTime);
        }
        const percentile = isNil(cycleTime)
          ? undefined
          : percentiles.find((p) => cycleTime >= p.cycleTime)?.percentile;
        const color =
          percentile === undefined
            ? "blue"
            : percentile >= 95
            ? "rgb(244, 67, 54)"
            : percentile >= 85
            ? "red"
            : percentile >= 70
            ? "orange"
            : "blue";
        return (
          <Space direction="horizontal" style={{ float: "right" }}>
            {formatNumber(cycleTime)}
            <Tag
              style={{
                // float: "right",
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
        compareNumbers(a.metrics.cycleTime, b.metrics.cycleTime, sortOrder),
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
      render: (issue: Issue) => (
        <Checkbox
          checked={!excludedIssueKeys.includes(issue.key)}
          onChange={(event) =>
            onSelectIssueChanged(issue.key, event.target.checked)
          }
        />
      ),
      width: "46px",
    };
    columns.unshift(selectColumn);
  }

  const IssueProgress = ({ issue }: { issue: Issue }) => {
    if (!parentEpic) return null;

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

  if (parentEpic) {
    columns.splice(8, 0, {
      title: "Progress",
      key: "progress",
      render: (_, issue) => {
        return <IssueProgress issue={issue} />;
      },
    });
  } else {
    columns.splice(8, 0, {
      title: "Parent",
      key: "parent",
      render: (_, issue) => {
        if (!issue.parent) {
          return null;
        }
        const path = issueDetailsPath({ issueKey: issue.parentKey, datasetId });
        return <IssueLink text={issue.parent.summary} path={path} tag />;
      },
    });
  }

  const [pageSize, setPageSize] = useState(10);

  return (
    <>
      <Table
        dataSource={issues}
        size="small"
        scroll={{ x: 1440 }}
        columns={columns}
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
