import { CompletedIssue, Issue } from "@entities/issues";
import { Scatterplot } from "./components/scatterplot";
import { useEffect, useState } from "react";
import { IssueDetailsDrawer } from "./components/issue-details-drawer";
import { IssuesTable } from "../../../components/issues-table";
import { useFilterContext } from "../../../filter/context";
import {
  Percentile,
  getCycleTimePercentiles,
} from "@usecases/scatterplot/cycle-times";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useDatasetContext } from "../../context";
import { Checkbox, Col, Row } from "antd";
import { ExpandableOptions } from "../../../components/expandable-options";
import { filterCompletedIssues } from "@data/issues";

export const ScatterplotPage = () => {
  const { issues } = useDatasetContext();

  const { filter } = useFilterContext();
  const [excludedIssues, setExcludedIssues] = useState<string[]>([]);

  const [filteredIssues, setFilteredIssues] = useState<CompletedIssue[]>([]);
  const [percentiles, setPercentiles] = useState<Percentile[] | undefined>();

  useEffect(() => {
    if (filter && issues) {
      const filteredIssues = filterCompletedIssues(issues, filter);
      const percentiles = getCycleTimePercentiles(filteredIssues);
      setFilteredIssues(filteredIssues);
      setPercentiles(percentiles);
    }
  }, [issues, filter, setFilteredIssues, setPercentiles, excludedIssues]);

  const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);

  const [showPercentileLabels, setShowPercentileLabels] = useState(false);

  return (
    <>
      <FilterOptionsForm
        issues={issues}
        filteredIssuesCount={filteredIssues.length}
        showDateSelector={true}
        showStatusFilter={false}
        showResolutionFilter={true}
        showHierarchyFilter={true}
      />

      <ExpandableOptions
        header={{
          title: "Chart Options",
          options: [
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
              checked={showPercentileLabels}
              onChange={(e) => setShowPercentileLabels(e.target.checked)}
            >
              Show percentile labels
            </Checkbox>
          </Col>
        </Row>
      </ExpandableOptions>

      {filter.dates ? (
        <Scatterplot
          issues={filteredIssues.filter(
            (issue) => !excludedIssues.includes(issue.key),
          )}
          percentiles={percentiles}
          range={filter.dates}
          setSelectedIssues={setSelectedIssues}
          showPercentileLabels={showPercentileLabels}
        />
      ) : null}
      <IssuesTable
        issues={filteredIssues}
        onExcludedIssuesChanged={setExcludedIssues}
        percentiles={percentiles}
        defaultSortField="cycleTime"
      />

      <IssueDetailsDrawer
        selectedIssues={selectedIssues}
        onClose={() => setSelectedIssues([])}
        open={selectedIssues.length > 0}
      />
    </>
  );
};
