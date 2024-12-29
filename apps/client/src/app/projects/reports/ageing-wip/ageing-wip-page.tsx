import { FC, useEffect, useState } from "react";
import {
  CompletedIssue,
  DateFilterType,
  HierarchyLevel,
  Issue,
  StartedIssue,
  filterIssues,
  fromClientFilter,
} from "@agileplanning-io/flow-metrics";
import { isNil, omit } from "remeda";
import { Checkbox, Collapse } from "antd";
import { useProjectContext } from "../../context";
import { AgeingWipChart } from "@agileplanning-io/flow-charts";
import { filterCompletedIssues } from "@agileplanning-io/flow-metrics";
import { isStarted } from "@agileplanning-io/flow-metrics";
import { useAtomValue } from "jotai";
import { IssueDetailsDrawer } from "../components/issue-details-drawer";
import { IssuesTable } from "@app/components/issues-table";
import {
  Percentile,
  defaultDateRange,
  getPercentiles,
} from "@agileplanning-io/flow-lib";
import { chartStyleAtom } from "../chart-style";
import { ChartParams, useChartParams } from "./hooks/use-chart-params";
import { LoadingSpinner } from "@app/components/loading-spinner";
import { useFilterParams } from "@app/filter/use-filter-params";
import {
  ControlBar,
  IssueFilterForm,
  ReportType,
} from "@agileplanning-io/flow-components";

export const AgeingWipPage = () => {
  const { issues } = useProjectContext();
  const { filter, setFilter } = useFilterParams({
    dates: defaultDateRange(),
    hierarchyLevel: HierarchyLevel.Story,
  });

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
      <IssueFilterForm
        issues={issues}
        filteredIssuesCount={ageingIssues.length}
        filter={filter}
        setFilter={setFilter}
        reportType={ReportType.Wip}
        showHierarchyFilter={true}
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

type ChartParamsFormProps = {
  chartParams: ChartParams;
  setChartParams: (params: ChartParams) => void;
};

const ChartParamsForm: FC<ChartParamsFormProps> = ({
  chartParams,
  setChartParams,
}) => {
  return (
    <ControlBar>
      <Checkbox
        checked={chartParams.includeStoppedIssues}
        onChange={(e) =>
          setChartParams({
            ...chartParams,
            includeStoppedIssues: e.target.checked,
          })
        }
      >
        <span style={{ whiteSpace: "nowrap" }}>Include stopped issues</span>
      </Checkbox>

      <Checkbox
        checked={chartParams.showPercentileLabels}
        onChange={(e) =>
          setChartParams({
            ...chartParams,
            showPercentileLabels: e.target.checked,
          })
        }
      >
        <span style={{ whiteSpace: "nowrap" }}>Show percentile labels</span>
      </Checkbox>
    </ControlBar>
  );
};
