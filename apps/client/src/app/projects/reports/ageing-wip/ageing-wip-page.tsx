import { useEffect, useState } from "react";
import {
  CompletedIssue,
  DateFilterType,
  HierarchyLevel,
  Issue,
  StartedIssue,
  filterIssues,
} from "@agileplanning-io/flow-metrics";
import { useFilterContext } from "../../../filter/context";
import { isNil, omit } from "remeda";
import { Collapse } from "antd";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useProjectContext } from "../../context";
import { AgeingWipChart } from "@agileplanning-io/flow-charts";
import { filterCompletedIssues } from "@agileplanning-io/flow-metrics";
import { isStarted } from "@agileplanning-io/flow-metrics";
import { useAtomValue } from "jotai";
import { IssueDetailsDrawer } from "../components/issue-details-drawer";
import { IssuesTable } from "@app/components/issues-table";
import { Percentile, getPercentiles } from "@agileplanning-io/flow-lib";
import { fromClientFilter } from "@app/filter/context/context";
import { chartStyleAtom } from "../chart-style";
import { useChartParams } from "./hooks/use-chart-params";
import { LoadingSpinner } from "@app/components/loading-spinner";
import { ChartParamsForm } from "./components/chart-params-form";

export const AgeingWipPage = () => {
  const { issues } = useProjectContext();
  const { filter } = useFilterContext();

  const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);
  const [ageingIssues, setAgeingIssues] = useState<StartedIssue[]>([]);
  const [benchmarkIssues, setBenchmarkIssues] = useState<CompletedIssue[]>([]);

  const [percentiles, setPercentiles] = useState<Percentile[]>([]);

  const chartStyle = useAtomValue(chartStyleAtom);

  const { chartParams, setChartParams } = useChartParams();

  useEffect(() => {
    // reset the selected issue list if we change the filter
    setSelectedIssues([]);
  }, [filter, chartParams.includeStoppedIssues]);

  useEffect(() => {
    if (filter && issues) {
      const benchmarkIssues = filterCompletedIssues(
        issues,
        fromClientFilter(filter, DateFilterType.Completed),
      );
      setBenchmarkIssues(benchmarkIssues);

      const ageingIssues = filterIssues(issues, omit(filter, ["dates"]))
        .filter((issue) => {
          if (chartParams.includeStoppedIssues) {
            return true;
          }

          const isStopped =
            issue.metrics.started && issue.statusCategory === "To Do";

          return !isStopped;
        })
        .filter(isStarted)
        .filter((issue) => !isNil(issue.metrics.age))
        .sort((i1, i2) => -(i1.metrics.age - i2.metrics.age));

      setAgeingIssues(ageingIssues);

      const percentiles = getPercentiles(
        benchmarkIssues.map((issue) => issue.metrics.cycleTime),
      );
      // reversing the percentiles make the bar color lookup easier
      setPercentiles(percentiles?.reverse() ?? []);
    }
  }, [
    issues,
    filter,
    chartParams?.includeStoppedIssues,
    setPercentiles,
    setBenchmarkIssues,
  ]);

  if (!chartParams) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <FilterOptionsForm
        issues={issues}
        filteredIssuesCount={ageingIssues.length}
        showDateSelector={true}
        showStatusFilter={false}
        showResolutionFilter={false}
        showHierarchyFilter={true}
        defaultHierarchyLevel={HierarchyLevel.Story}
      />

      <ChartParamsForm
        chartParams={chartParams}
        setChartParams={setChartParams}
      />

      <AgeingWipChart
        issues={ageingIssues}
        percentiles={percentiles}
        setSelectedIssues={setSelectedIssues}
        showPercentileLabels={chartParams.showPercentileLabels}
        style={chartStyle}
      />

      <IssueDetailsDrawer
        selectedIssues={selectedIssues}
        onClose={() => setSelectedIssues([])}
        open={selectedIssues.length > 0}
      />

      <Collapse ghost>
        <Collapse.Panel key="benchmark-issues" header="Benchmark Issues">
          <IssuesTable
            issues={benchmarkIssues}
            percentiles={percentiles}
            defaultSortField="cycleTime"
          />
        </Collapse.Panel>
      </Collapse>
    </>
  );
};
