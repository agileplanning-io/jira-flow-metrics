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
import { Checkbox, Col, Collapse, Row } from "antd";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useProjectContext } from "../../context";
import { ExpandableOptions } from "../../../components/expandable-options";
import { useSearchParams } from "react-router-dom";
import { AgeingWipChart } from "@agileplanning-io/flow-charts";
import { filterCompletedIssues } from "@agileplanning-io/flow-metrics";
import { isStarted } from "@agileplanning-io/flow-metrics";
import { useAtomValue } from "jotai";
import { IssueDetailsDrawer } from "../components/issue-details-drawer";
import { IssuesTable } from "@app/components/issues-table";
import { Percentile, getPercentiles } from "@agileplanning-io/flow-lib";
import { fromClientFilter } from "@app/filter/context/context";
import { chartStyleAtom } from "../chart-style";

export const AgeingWipPage = () => {
  const { issues } = useProjectContext();
  const { filter } = useFilterContext();

  const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);
  const [ageingIssues, setAgeingIssues] = useState<StartedIssue[]>([]);
  const [benchmarkIssues, setBenchmarkIssues] = useState<CompletedIssue[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();

  const [percentiles, setPercentiles] = useState<Percentile[]>([]);

  const chartStyle = useAtomValue(chartStyleAtom);

  const includeStoppedIssues =
    searchParams.get("includeStoppedIssues") === "true";
  const setIncludeStoppedIssues = (includeStoppedIssues: boolean) =>
    setSearchParams((prev) => {
      prev.set("includeStoppedIssues", includeStoppedIssues.toString());
      return prev;
    });

  const showPercentileLabels =
    searchParams.get("showPercentileLabels") === "true";
  const setShowPercentileLabels = (showPercentileLabels: boolean) =>
    setSearchParams((prev) => {
      prev.set("showPercentileLabels", showPercentileLabels.toString());
      return prev;
    });

  useEffect(() => {
    // reset the selected issue list if we change the filter
    setSelectedIssues([]);
  }, [filter, includeStoppedIssues]);

  useEffect(() => {
    if (filter && issues) {
      const benchmarkIssues = filterCompletedIssues(
        issues,
        fromClientFilter(filter, DateFilterType.Completed),
      );
      setBenchmarkIssues(benchmarkIssues);

      const ageingIssues = filterIssues(issues, omit(filter, ["dates"]))
        .filter((issue) => {
          if (includeStoppedIssues) {
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
    includeStoppedIssues,
    setPercentiles,
    setBenchmarkIssues,
  ]);

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
      <ExpandableOptions
        header={{
          title: "Chart Options",
          options: [
            {
              value: includeStoppedIssues
                ? "Include stopped issues"
                : "Exclude stopped issues",
            },
            {
              value: showPercentileLabels
                ? "Show percentile labels"
                : "Hide percentile labels",
            },
          ],
        }}
      >
        <Row gutter={[8, 8]}>
          <Col span={6}>
            <Checkbox
              checked={includeStoppedIssues}
              onChange={(e) => setIncludeStoppedIssues(e.target.checked)}
            >
              Include stopped issues
            </Checkbox>
            <Checkbox
              checked={showPercentileLabels}
              onChange={(e) => setShowPercentileLabels(e.target.checked)}
            >
              Show percentile labels
            </Checkbox>
          </Col>
        </Row>
      </ExpandableOptions>

      <AgeingWipChart
        issues={ageingIssues}
        percentiles={percentiles}
        setSelectedIssues={setSelectedIssues}
        showPercentileLabels={showPercentileLabels}
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
