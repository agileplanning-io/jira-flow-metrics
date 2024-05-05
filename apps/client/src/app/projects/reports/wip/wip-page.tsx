import { useEffect, useState } from "react";
import {
  HierarchyLevel,
  Issue,
  WipResult,
  calculateWip,
  filterIssues,
} from "@agileplanning-io/flow-metrics";
import { IssuesTable } from "../../../components/issues-table";
import { useFilterContext } from "../../../filter/context";
import { WipChart } from "@agileplanning-io/flow-charts/src/wip/wip-chart";
import { omit } from "remeda";
import { Checkbox, Col, Row } from "antd";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useProjectContext } from "../../context";
import { ExpandableOptions } from "../../../components/expandable-options";
import { useSearchParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { chartStyleAtom } from "../chart-style";

export const WipPage = () => {
  const { issues } = useProjectContext();
  const { filter } = useFilterContext();

  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();

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
      const filteredIssues = filterIssues(
        issues,
        omit(filter, ["dates"]),
      ).filter((issue) => {
        if (includeStoppedIssues) {
          return true;
        }

        const isStopped =
          issue.metrics.started && issue.statusCategory === "To Do";

        return !isStopped;
      });
      setFilteredIssues(filteredIssues);
    }
  }, [issues, filter, includeStoppedIssues, setFilteredIssues]);

  const [wipResult, setWipResult] = useState<WipResult>();

  useEffect(() => {
    if (!filter?.dates) {
      return;
    }

    setWipResult(
      calculateWip({
        issues: filteredIssues,
        range: filter.dates,
      }),
    );
  }, [filter, filteredIssues]);

  return (
    <>
      <FilterOptionsForm
        issues={issues}
        filteredIssuesCount={filteredIssues.length}
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

      {wipResult ? (
        <WipChart
          result={wipResult}
          setSelectedIssues={setSelectedIssues}
          showPercentileLabels={showPercentileLabels}
          style={chartStyle}
        />
      ) : null}
      <div style={{ margin: 16 }} />
      <IssuesTable issues={selectedIssues} defaultSortField="cycleTime" />
    </>
  );
};
