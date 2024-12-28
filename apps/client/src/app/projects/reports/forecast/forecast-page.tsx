import { useEffect, useState } from "react";
import {
  CompletedIssue,
  DateFilterType,
  HierarchyLevel,
  SummaryResult,
  filterCompletedIssues,
  forecast,
  fromClientFilter,
  toClientFilter,
} from "@agileplanning-io/flow-metrics";
import { useAtomValue } from "jotai";
import { ForecastChart } from "@agileplanning-io/flow-charts";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useProjectContext } from "../../context";
import { useChartParams } from "./hooks/use-chart-params";
import { chartStyleAtom } from "../chart-style";
import { ChartParamsForm } from "./components/chart-params-form";
import { useFilterParams } from "@app/filter/use-filter-params";
import { defaultDateRange } from "@agileplanning-io/flow-lib";
import { Project } from "@data/projects";

export const ForecastPage = () => {
  const { issues } = useProjectContext();
  const { filter, setFilter } = useFilterParams((project: Project) => ({
    ...toClientFilter(project.defaultCompletedFilter),
    dates: defaultDateRange(),
    hierarchyLevel: HierarchyLevel.Story,
  }));
  const [filteredIssues, setFilteredIssues] = useState<CompletedIssue[]>([]);
  const { chartParams, setChartParams } = useChartParams();
  const chartStyle = useAtomValue(chartStyleAtom);

  useEffect(() => {
    if (filter && issues) {
      const filteredIssues = filterCompletedIssues(
        issues,
        fromClientFilter(filter, DateFilterType.Completed),
      ).sort(
        (i1, i2) =>
          i1.metrics.completed.getTime() - i2.metrics.completed.getTime(),
      );
      setFilteredIssues(filteredIssues);
    }
  }, [issues, filter, setFilteredIssues]);

  const [result, setResult] = useState<SummaryResult>();

  useEffect(() => {
    if (!filteredIssues || filteredIssues.length === 0 || !chartParams) return;
    const result = forecast({
      interval: filter?.dates,
      selectedIssues: filteredIssues,
      ...chartParams,
    });
    setResult(result);
  }, [filteredIssues, filter, chartParams]);

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
      {result ? (
        <ForecastChart
          result={result}
          style={chartStyle}
          showPercentiles={chartParams.showPercentileLabels}
        />
      ) : null}
    </>
  );
};
