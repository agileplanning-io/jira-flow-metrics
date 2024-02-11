import { useEffect, useState } from "react";
import {
  HierarchyLevel,
  Issue,
  StartedIssue,
  filterIssues,
} from "@jbrunton/flow-metrics";
import { useFilterContext } from "../../../filter/context";
import { AgeingWipChart } from "./components/ageing-wip-chart";
import { isNil, omit } from "rambda";
import { Checkbox, Col, Row } from "antd";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useDatasetContext } from "../../context";
import { ExpandableOptions } from "../../../components/expandable-options";
import { useSearchParams } from "react-router-dom";
import { Percentile, getCycleTimePercentiles } from "@jbrunton/flow-charts";
import { filterCompletedIssues } from "@jbrunton/flow-metrics";
import { isStarted } from "@jbrunton/flow-metrics";
import { IssueDetailsDrawer } from "../scatterplot/components/issue-details-drawer";

export const AgeingWipPage = () => {
  const { issues } = useDatasetContext();
  const { filter } = useFilterContext();

  const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);
  const [ageingIssues, setAgeingIssues] = useState<StartedIssue[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();

  const [percentiles, setPercentiles] = useState<Percentile[]>([]);

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
      const benchmarkIssues = filterCompletedIssues(issues, filter);
      const ageingIssues = filterIssues(issues, omit(["dates"], filter))
        .filter(
          (issue) =>
            issue.hierarchyLevel === HierarchyLevel.Epic ||
            issue.metrics.includedInEpic,
        )
        .filter((issue) => {
          if (includeStoppedIssues) {
            return true;
          }

          const isStopped =
            issue.metrics.started && issue.statusCategory === "To Do";

          return !isStopped;
        })
        .filter(isStarted)
        .filter((issue) => !isNil(issue.metrics.age));

      setAgeingIssues(ageingIssues);

      const percentiles = getCycleTimePercentiles(benchmarkIssues);
      setPercentiles(percentiles ?? []);
    }
  }, [issues, filter, includeStoppedIssues, setPercentiles]);

  return (
    <>
      <FilterOptionsForm
        issues={issues}
        filteredIssuesCount={ageingIssues.length}
        showDateSelector={true}
        showStatusFilter={false}
        showResolutionFilter={false}
        showHierarchyFilter={true}
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
      />

      <IssueDetailsDrawer
        selectedIssues={selectedIssues}
        onClose={() => setSelectedIssues([])}
        open={selectedIssues.length > 0}
      />
    </>
  );
};
