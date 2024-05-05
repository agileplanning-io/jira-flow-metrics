import { useEffect, useState } from "react";
import {
  CompletedIssue,
  DateFilterType,
  HierarchyLevel,
  SummaryResult,
  filterCompletedIssues,
  forecast,
} from "@agileplanning-io/flow-metrics";
import { useAtomValue } from "jotai";
import { useFilterContext } from "../../../filter/context";
import { ForecastChart } from "@agileplanning-io/flow-charts";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useProjectContext } from "../../context";
import { useChartParams } from "./hooks/use-chart-params";
import { fromClientFilter } from "@app/filter/context/context";
import { chartStyleAtom } from "../chart-style";
import { ChartParamsForm } from "./components/chart-params-form";

export const ForecastPage = () => {
  const { issues } = useProjectContext();
  const { filter } = useFilterContext();
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
      selectedIssues: filteredIssues,
      ...chartParams,
    });
    setResult(result);
  }, [filteredIssues, filter, chartParams]);

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
