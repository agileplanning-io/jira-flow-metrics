import {
  HierarchyLevel,
  Issue,
  TimeSpentRow,
  timeSpentInPeriod,
} from "@agileplanning-io/flow-metrics";
import { useEffect, useState } from "react";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useProjectContext } from "../../context";
import { Space, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  IssueResolution,
  IssueStatus,
} from "@agileplanning-io/flow-components";
import { useNavigationContext } from "../../../navigation/context";
import { DateFilterType, filterIssues } from "@agileplanning-io/flow-metrics";
import { IssueDetailsDrawer } from "../components/issue-details-drawer";
import { ZoomInOutlined } from "@ant-design/icons";
import { issueDetailsPath } from "@app/navigation/paths";
import {
  IssueExternalLink,
  IssueLink,
} from "@app/projects/components/issue-links";
import { useOutletContext } from "react-router-dom";
import { ProjectsContext } from "@app/projects/projects-layout";
import { fromClientFilter } from "@app/filter/context/client-issue-filter";
import { useFilterParams } from "@app/filter/context/use-filter-params";
import { defaultDateRange } from "@agileplanning-io/flow-lib";

export const TimeSpentPage = () => {
  const { projectId } = useNavigationContext();
  const { issues } = useProjectContext();
  const { hidePolicyForm } = useOutletContext<ProjectsContext>();

  const { filter, setFilter } = useFilterParams({
    dates: defaultDateRange(),
  });

  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  hidePolicyForm();

  useEffect(() => {
    if (filter && issues) {
      const filteredStories = filterIssues(
        issues,
        fromClientFilter(
          { ...filter, hierarchyLevel: HierarchyLevel.Story },
          DateFilterType.Intersects,
        ),
      );
      const epics = issues.filter(
        (issue) => issue.hierarchyLevel === HierarchyLevel.Epic,
      );
      setFilteredIssues([...filteredStories, ...epics]);
    }
  }, [issues, filter, setFilteredIssues]);

  const columns: ColumnsType<TimeSpentRow> = [
    {
      key: "expand",
    },
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      render(_, row) {
        if (row.rowType === "category") {
          return row.summary;
        }
        const path = issueDetailsPath({ issueKey: row.key, projectId });
        return <IssueLink text={row.key} path={path} />;
      },
    },
    {
      key: "open",
      render: (_, { key, externalUrl }) =>
        externalUrl ? (
          <Space>
            <IssueExternalLink externalUrl={externalUrl} />
            <a
              onClick={() =>
                setSelectedIssue(
                  issues?.find((issue) => issue.key === key) ?? null,
                )
              }
            >
              <ZoomInOutlined />
            </a>
          </Space>
        ) : null,
    },
    {
      title: "Summary",
      key: "summary",
      render(_, row) {
        return row.rowType === "category" ? null : row.summary;
      },
    },
    {
      title: "Issue Type",
      key: "issueType",
      dataIndex: "issueType",
    },
    {
      title: "Status",
      key: "status",
      render: (_, { status, statusCategory }) =>
        status && statusCategory ? (
          <IssueStatus {...{ status, statusCategory }} />
        ) : null,
    },
    {
      title: "Resolution",
      key: "resolution",
      render: (_, row) => <IssueResolution {...row} />,
    },
    {
      title: "Issue Count",
      render(_, row) {
        return row.issueCount;
      },
    },
    {
      title: "Days In Period",
      render(_, row) {
        return row.timeInPeriod?.toFixed(0);
      },
    },
    {
      title: "(%)",
      render(_, row) {
        if (row.percentInPeriod !== undefined) {
          return `${row.percentInPeriod?.toFixed(0)}%`;
        }
      },
    },
  ];

  const result = filter?.dates
    ? timeSpentInPeriod(filteredIssues, filter.dates)
    : [];

  return (
    <>
      <FilterOptionsForm
        filter={filter}
        setFilter={setFilter}
        issues={issues}
        filteredIssuesCount={filteredIssues.length}
        showDateSelector={true}
        showStatusFilter={false}
        showHierarchyFilter={false}
        showResolutionFilter={true}
      />

      <Table
        rowClassName={(row) => `${row.rowType}-header`}
        columns={columns}
        size="small"
        dataSource={result}
        defaultExpandedRowKeys={["epics", "unassigned"]}
        indentSize={0}
      />

      <IssueDetailsDrawer
        selectedIssues={selectedIssue ? [selectedIssue] : []}
        onClose={() => setSelectedIssue(null)}
        open={selectedIssue !== null}
      />
    </>
  );
};
