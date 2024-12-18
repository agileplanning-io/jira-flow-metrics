import {
  CompletedIssue,
  DateFilterType,
  HierarchyLevel,
  Issue,
  filterCompletedIssues,
} from "@agileplanning-io/flow-metrics";
import { Scatterplot } from "@agileplanning-io/flow-charts";
import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { IssueDetailsDrawer } from "../components/issue-details-drawer";
import { IssuesTable } from "../../../components/issues-table";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useProjectContext } from "../../context";
import {
  Percentile,
  asAbsolute,
  defaultDateRange,
  getPercentiles,
} from "@agileplanning-io/flow-lib";
import {
  fromClientFilter,
  toClientFilter,
} from "@app/filter/client-issue-filter";
import { chartStyleAtom } from "../chart-style";
import { useChartParams } from "./hooks/use-chart-params";
import { ChartParamsForm } from "./components/chart-params-form";
import { useFilterParams } from "@app/filter/use-filter-params";
import { Project } from "@data/projects";
import { Button } from "antd";
import { reverse, sortBy } from "remeda";
import { downloadCsv } from "@data/csv";

export const ScatterplotPage = () => {
  const { issues } = useProjectContext();

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
    downloadCsv(sortBy(filteredIssues, (issue) => -issue.metrics.cycleTime));
  };

  return (
    <>
      {filter ? (
        <FilterOptionsForm
          issues={issues}
          filteredIssuesCount={filteredIssues?.length}
          filter={filter}
          setFilter={setFilter}
          showDateSelector={true}
          showStatusFilter={false}
          showResolutionFilter={true}
          showHierarchyFilter={true}
        />
      ) : null}

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
