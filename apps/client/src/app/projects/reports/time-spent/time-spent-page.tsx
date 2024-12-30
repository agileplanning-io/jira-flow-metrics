import {
  HierarchyLevel,
  Issue,
  TimeSpentRow,
  WorkflowScheme,
  fromClientFilter,
  getSelectedStages,
  timeSpentInPeriod,
} from "@agileplanning-io/flow-metrics";
import { FC, Key, useEffect, useState } from "react";
import { useProjectContext } from "../../context";
import { Space, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  ControlBar,
  FormControl,
  IssueFilterForm,
  IssueResolution,
  IssueStatus,
  Popdown,
  ReportType,
  WorkflowStagesTable,
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
import { useFilterParams } from "@app/filter/use-filter-params";
import { asAbsolute, defaultDateRange } from "@agileplanning-io/flow-lib";
import { z } from "zod";
import { useChartParamsState } from "../hooks/use-chart-params";
import { flat } from "remeda";

export const TimeSpentPage = () => {
  const { projectId } = useNavigationContext();
  const { issues, project } = useProjectContext();
  const { hidePolicyForm } = useOutletContext<ProjectsContext>();

  const { filter, setFilter } = useFilterParams({
    dates: defaultDateRange(),
  });

  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const { chartParams, setChartParams } = useChartParams();

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

  useEffect(() => {
    if (chartParams && !chartParams.statuses && project) {
      const defaultStatuses = flat(
        project.workflowScheme.stories.stages
          .filter((stage) => stage.selectByDefault)
          .map((stage) => stage.statuses.map((status) => status.name)),
      );
      setChartParams({ statuses: defaultStatuses });
    }
  }, [chartParams, setChartParams, project]);

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
    ? timeSpentInPeriod(
        filteredIssues,
        asAbsolute(filter.dates),
        chartParams.statuses ?? [],
      )
    : [];

  return (
    <>
      <IssueFilterForm
        issues={issues}
        filteredIssuesCount={filteredIssues.length}
        filter={filter}
        setFilter={setFilter}
        reportType={ReportType.Completed}
        showHierarchyFilter={false}
      />

      {project ? (
        <ChartParamsForm
          chartParams={chartParams}
          setChartParams={setChartParams}
          workflowScheme={project?.workflowScheme}
        />
      ) : null}

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

const chartParamsSchema = z.object({
  statuses: z.array(z.string()).optional(),
});

type ChartParams = z.infer<typeof chartParamsSchema>;

const useChartParams = () => useChartParamsState(chartParamsSchema);

type ChartParamsFormProps = {
  workflowScheme: WorkflowScheme;
  chartParams: ChartParams;
  setChartParams: (params: ChartParams) => void;
};

const ChartParamsForm: FC<ChartParamsFormProps> = ({
  chartParams,
  setChartParams,
  workflowScheme,
}) => {
  const selectedStages = getSelectedStages(
    workflowScheme.stories,
    chartParams.statuses,
  );

  const onStagesChanged = (keys: Key[]) => {
    const statuses: string[] = flat(
      workflowScheme.stories.stages
        .filter((stage) => keys.includes(stage.name))
        .map((stage) => stage.statuses.map((status) => status.name)),
    );
    setChartParams({ statuses });
  };

  return (
    <ControlBar>
      <FormControl label="Selected stages">
        <Popdown
          title="Select story stages"
          value={selectedStages}
          renderLabel={(selectedStoryStages) => selectedStoryStages.join(", ")}
          onValueChanged={onStagesChanged}
        >
          {(value, setValue) => (
            <WorkflowStagesTable
              workflowStages={workflowScheme.stories.stages}
              selectedStages={value}
              onSelectionChanged={(stages) => setValue(stages as string[])}
            />
          )}
        </Popdown>
      </FormControl>
    </ControlBar>
  );
};
