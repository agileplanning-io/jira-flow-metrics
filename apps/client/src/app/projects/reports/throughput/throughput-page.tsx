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
import { Interval, getOverlappingInterval } from "@agileplanning-io/flow-lib";
import { ThroughputChart } from "@agileplanning-io/flow-charts";
import { IssuesTable } from "../../../components/issues-table";
import { useFilterContext } from "../../../filter/context";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useProjectContext } from "../../context";
import { fromClientFilter } from "@app/filter/context/context";
import { useAtomValue } from "jotai";
import { chartStyleAtom } from "../chart-style";
import { useChartParams } from "./hooks/use-chart-params";
import { ChartParamsForm } from "./components/chart-params-form";

export const ThroughputPage = () => {
  const { issues } = useProjectContext();
  const { filter } = useFilterContext();

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
        issues={issues}
        filteredIssuesCount={filteredIssues.length}
        showDateSelector={true}
        showStatusFilter={false}
        showResolutionFilter={true}
        showHierarchyFilter={true}
        defaultHierarchyLevel={HierarchyLevel.Story}
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
