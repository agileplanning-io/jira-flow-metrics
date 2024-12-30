import {
  CompletedIssue,
  DateFilterType,
  HierarchyLevel,
  Issue,
  filterCompletedIssues,
  fromClientFilter,
  toClientFilter,
} from "@agileplanning-io/flow-metrics";
import { Scatterplot } from "@agileplanning-io/flow-charts";
import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { IssueDetailsDrawer } from "../components/issue-details-drawer";
import { IssuesTable } from "../../../components/issues-table";
import { useProjectContext } from "../../context";
import {
  Percentile,
  asAbsolute,
  defaultDateRange,
  getPercentiles,
} from "@agileplanning-io/flow-lib";
import { chartStyleAtom } from "../chart-style";
import { ChartParamsForm } from "../components/completed-issue-reports/chart-params-form";
import { useFilterParams } from "@app/filter/use-filter-params";
import { Project } from "@data/projects";
import { Button } from "antd";
import { reverse, sortBy } from "remeda";
import { downloadCsv } from "@data/csv";
import { IssueFilterForm, ReportType } from "@agileplanning-io/flow-components";
import { useChartParams } from "../components/completed-issue-reports/use-chart-params";

export const ScatterplotPage = () => {
  const { project, issues, currentPolicy } = useProjectContext();

  const { filter, setFilter } = useFilterParams((project: Project) => ({
    ...toClientFilter(project.defaultCompletedFilter),
    dates: defaultDateRange(),
    hierarchyLevel: HierarchyLevel.Story,
  }));

  const [excludedIssues, setExcludedIssues] = useState<string[]>([]);

  const [filteredIssues, setFilteredIssues] = useState<CompletedIssue[]>([]);
  const [percentiles, setPercentiles] = useState<Percentile[] | undefined>();

  const chartStyle = useAtomValue(chartStyleAtom);

  const { chartParams, setChartParams } = useChartParams();

  useEffect(() => {
    if (filter && issues) {
      const filteredIssues = filterCompletedIssues(
        issues,
        fromClientFilter(filter, DateFilterType.Completed),
      );
      const percentiles = getPercentiles(
        filteredIssues
          .filter((issue) => !excludedIssues.includes(issue.key))
          .map((issue) => issue.metrics.cycleTime),
      );
      setFilteredIssues(filteredIssues);
      setPercentiles(reverse(percentiles));
    }
  }, [issues, filter, setFilteredIssues, setPercentiles, excludedIssues]);

  const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);

  const exportIssues = () => {
    if (!project || !currentPolicy) {
      return;
    }

    const issues = sortBy(filteredIssues, (issue) => -issue.metrics.cycleTime);
    downloadCsv(project, currentPolicy, issues);
  };

  return (
    <>
      <IssueFilterForm
        issues={issues}
        filteredIssuesCount={filteredIssues.length}
        filter={filter}
        setFilter={setFilter}
        reportType={ReportType.Completed}
        showHierarchyFilter={true}
      />

      <ChartParamsForm
        chartParams={chartParams}
        setChartParams={setChartParams}
      />

      {filter?.dates ? (
        <Scatterplot
          issues={filteredIssues.filter(
            (issue) => !excludedIssues.includes(issue.key),
          )}
          percentiles={percentiles}
          range={asAbsolute(filter.dates)}
          setSelectedIssues={setSelectedIssues}
          showPercentileLabels={chartParams.showPercentileLabels}
          hideOutliers={chartParams.hideOutliers}
          style={chartStyle}
        />
      ) : null}

      <div style={{ margin: 16 }} />
      <IssuesTable
        issues={filteredIssues}
        onExcludedIssuesChanged={setExcludedIssues}
        percentiles={percentiles}
        defaultSortField="cycleTime"
        footer={() => <Button onClick={exportIssues}>Export</Button>}
      />

      <IssueDetailsDrawer
        selectedIssues={selectedIssues}
        onClose={() => setSelectedIssues([])}
        open={selectedIssues.length > 0}
      />
    </>
  );
};
