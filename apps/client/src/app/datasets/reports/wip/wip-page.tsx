import { useEffect, useState } from "react";
import { HierarchyLevel, Issue, filterIssues } from "@jbrunton/flow-metrics";
import { IssuesTable } from "../../../components/issues-table";
import { useFilterContext } from "../../../filter/context";
import { WipResult, calculateWip } from "@usecases/wip/wip";
import { WipChart } from "./components/wip-chart";
import { omit } from "rambda";
import { Checkbox, Col, Row } from "antd";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useDatasetContext } from "../../context";
import { ExpandableOptions } from "../../../components/expandable-options";
import { useSearchParams } from "react-router-dom";

export const WipPage = () => {
  const { issues } = useDatasetContext();
  const { filter } = useFilterContext();

  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();

  const includeStoppedIssues =
    searchParams.get("includeStoppedIssues") === "true";
  const setIncludeStoppedIssues = (includeStoppedIssues: boolean) =>
    setSearchParams((prev) => {
      prev.set("includeStoppedIssues", includeStoppedIssues.toString());
      return prev;
    });

  useEffect(() => {
    // reset the selected issue list if we change the filter
    setSelectedIssues([]);
  }, [filter, includeStoppedIssues]);

  useEffect(() => {
    if (filter && issues) {
      const filteredIssues = filterIssues(issues, omit(["dates"], filter))
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
          </Col>
        </Row>
      </ExpandableOptions>

      {wipResult ? (
        <WipChart result={wipResult} setSelectedIssues={setSelectedIssues} />
      ) : null}
      <div style={{ margin: 16 }} />
      <IssuesTable issues={selectedIssues} defaultSortField="cycleTime" />
    </>
  );
};
