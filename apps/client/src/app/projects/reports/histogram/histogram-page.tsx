import {
  CompletedIssue,
  DateFilterType,
  HierarchyLevel,
  filterCompletedIssues,
} from "@agileplanning-io/flow-metrics";
import { Histogram } from "@agileplanning-io/flow-charts";
import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { IssuesTable } from "../../../components/issues-table";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useProjectContext } from "../../context";
import { IssueDetailsDrawer } from "../components/issue-details-drawer";
import {
  Percentile,
  defaultDateRange,
  getPercentiles,
} from "@agileplanning-io/flow-lib";
import {
  fromClientFilter,
  toClientFilter,
} from "@app/filter/context/client-issue-filter";
import { chartStyleAtom } from "../chart-style";
import { useChartParams } from "./hooks/use-chart-params";
import { ChartParamsForm } from "./components/chart-params-form";
import { Project } from "@data/projects";
import { useFilterParams } from "@app/filter/context/use-filter-params";

export const HistogramPage = () => {
  const { issues } = useProjectContext();

  const { filter, setFilter } = useFilterParams((project: Project) => ({
    ...toClientFilter(project.defaultCompletedFilter),
    dates: defaultDateRange(),
    hierarchyLevel: HierarchyLevel.Story,
  }));

  const [excludedIssues, setExcludedIssues] = useState<string[]>([]);

  const [filteredIssues, setFilteredIssues] = useState<CompletedIssue[]>([]);
  const [percentiles, setPercentiles] = useState<Percentile[] | undefined>();

  const { chartParams, setChartParams } = useChartParams();

  const chartStyle = useAtomValue(chartStyleAtom);

  useEffect(() => {
    if (filter && issues) {
      const filteredIssues = filterCompletedIssues(
        issues,
        fromClientFilter(filter, DateFilterType.Completed),
      );
      setFilteredIssues(filteredIssues);
      const percentiles = getPercentiles(
        filteredIssues
          .filter((issue) => !excludedIssues.includes(issue.key))
          .map((issue) => issue.metrics.cycleTime),
      );
      setPercentiles(percentiles);
    }
  }, [issues, filter, setFilteredIssues, setPercentiles, excludedIssues]);

  const [selectedIssues, setSelectedIssues] = useState<CompletedIssue[]>([]);

  return (
    <>
      <FilterOptionsForm
        filter={filter}
        setFilter={setFilter}
        issues={issues}
        filteredIssuesCount={filteredIssues.length}
        showDateSelector={true}
        showStatusFilter={false}
        showResolutionFilter={true}
        showHierarchyFilter={true}
      />

      <ChartParamsForm
        chartParams={chartParams}
        setChartParams={setChartParams}
      />

      {filter?.dates ? (
        <Histogram
          issues={filteredIssues.filter(
            (issue) => !excludedIssues.includes(issue.key),
          )}
          percentiles={percentiles}
          setSelectedIssues={setSelectedIssues}
          showPercentileLabels={chartParams.showPercentileLabels}
          hideOutliers={chartParams.hideOutliers}
          style={chartStyle}
        />
      ) : null}
      <div style={{ margin: 16 }} />
      <IssuesTable
        issues={filteredIssues}
        percentiles={percentiles}
        onExcludedIssuesChanged={setExcludedIssues}
        defaultSortField="cycleTime"
      />
      <IssueDetailsDrawer
        selectedIssues={selectedIssues}
        open={selectedIssues.length > 0}
        onClose={() => setSelectedIssues([])}
      />
    </>
  );
};
