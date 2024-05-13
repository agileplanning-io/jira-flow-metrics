import { useEffect, useState } from "react";
import {
  CompletedIssue,
  DateFilterType,
  HierarchyLevel,
  Issue,
  ThroughputResult,
  calculateThroughput,
  filterCompletedIssues,
} from "@agileplanning-io/flow-metrics";
import {
  Interval,
  defaultDateRange,
  getOverlappingInterval,
} from "@agileplanning-io/flow-lib";
import { ThroughputChart } from "@agileplanning-io/flow-charts";
import { IssuesTable } from "../../../components/issues-table";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useProjectContext } from "../../context";
import {
  fromClientFilter,
  toClientFilter,
} from "@app/filter/client-issue-filter";
import { useAtomValue } from "jotai";
import { chartStyleAtom } from "../chart-style";
import { useChartParams } from "./hooks/use-chart-params";
import { ChartParamsForm } from "./components/chart-params-form";
import { useFilterParams } from "@app/filter/use-filter-params";
import { Project } from "@data/projects";

export const ThroughputPage = () => {
  const { issues } = useProjectContext();
  const { filter, setFilter } = useFilterParams((project: Project) => ({
    ...toClientFilter(project.defaultCompletedFilter),
    dates: defaultDateRange(),
    hierarchyLevel: HierarchyLevel.Story,
  }));

  const [filteredIssues, setFilteredIssues] = useState<CompletedIssue[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);
  const [throughputResult, setThroughputResult] = useState<ThroughputResult>();

  const { chartParams, setChartParams } = useChartParams();

  const chartStyle = useAtomValue(chartStyleAtom);

  useEffect(() => {
    if (!filter?.dates || !issues) {
      return;
    }

    const interval: Interval = getOverlappingInterval(
      filter.dates,
      chartParams.timeUnit,
    );

    const filteredIssues = filterCompletedIssues(
      issues,
      fromClientFilter(
        { ...filter, dates: interval },
        DateFilterType.Completed,
      ),
    );
    setFilteredIssues(filteredIssues);

    setThroughputResult(
      calculateThroughput({
        issues: filteredIssues,
        interval,
        timeUnit: chartParams.timeUnit,
      }),
    );
  }, [filter, chartParams.timeUnit, issues]);

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

      {throughputResult ? (
        <ThroughputChart
          result={throughputResult}
          timeUnit={chartParams.timeUnit}
          setSelectedIssues={setSelectedIssues}
          style={chartStyle}
          showPercentileLabels={chartParams.showPercentileLabels}
        />
      ) : null}
      <div style={{ margin: 16 }} />
      <IssuesTable issues={selectedIssues} defaultSortField="cycleTime" />
    </>
  );
};
