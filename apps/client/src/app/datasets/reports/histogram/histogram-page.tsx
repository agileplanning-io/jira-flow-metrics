import { CompletedIssue, filterCompletedIssues } from "@agileplanning-io/flow-metrics";
import { Percentile, getCycleTimePercentiles } from "@agileplanning-io/flow-charts";
import { useEffect, useState } from "react";
import { IssuesTable } from "../../../components/issues-table";
import { useFilterContext } from "../../../filter/context";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useDatasetContext } from "../../context";
import { Checkbox, Col, Popover, Row, Space } from "antd";
import { ExpandableOptions } from "../../../components/expandable-options";
import { useSearchParams } from "react-router-dom";
import { Histogram } from "./components/histogram";
import { IssueDetailsDrawer } from "../scatterplot/components/issue-details-drawer";
import { QuestionCircleOutlined } from "@ant-design/icons";

export const HistogramPage = () => {
  const { issues } = useDatasetContext();

  const { filter } = useFilterContext();
  const [excludedIssues, setExcludedIssues] = useState<string[]>([]);

  const [filteredIssues, setFilteredIssues] = useState<CompletedIssue[]>([]);
  const [percentiles, setPercentiles] = useState<Percentile[] | undefined>();

  const [searchParams, setSearchParams] = useSearchParams();

  const showPercentileLabels =
    searchParams.get("showPercentileLabels") === "true";
  const setShowPercentileLabels = (showPercentileLabels: boolean) =>
    setSearchParams((prev) => {
      prev.set("showPercentileLabels", showPercentileLabels.toString());
      return prev;
    });

  const hideOutliers = searchParams.get("hideOutliers") === "true";
  const setHideOutliers = (hideOutliers: boolean) =>
    setSearchParams((prev) => {
      prev.set("hideOutliers", hideOutliers.toString());
      return prev;
    });

  useEffect(() => {
    if (filter && issues) {
      const filteredIssues = filterCompletedIssues(issues, filter);
      setFilteredIssues(filteredIssues);
      const percentiles = getCycleTimePercentiles(
        filteredIssues.filter((issue) => !excludedIssues.includes(issue.key)),
      );
      setPercentiles(percentiles);
    }
  }, [issues, filter, setFilteredIssues, setPercentiles, excludedIssues]);

  const [selectedIssues, setSelectedIssues] = useState<CompletedIssue[]>([]);

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
            {
              value: hideOutliers ? "Hide outliers" : "Show outliers",
            },
          ],
        }}
      >
        <Row gutter={[8, 8]}>
          <Col span={6}>
            <Space direction="vertical">
              <Checkbox
                checked={showPercentileLabels}
                onChange={(e) => setShowPercentileLabels(e.target.checked)}
              >
                Show percentile labels
              </Checkbox>
              <Checkbox
                checked={hideOutliers}
                onChange={(e) => setHideOutliers(e.target.checked)}
              >
                Hide outliers
                <Popover
                  placement="right"
                  content={
                    "Outliers are calculated using the Tukey Fence method"
                  }
                >
                  {" "}
                  <a href="#">
                    <QuestionCircleOutlined />
                  </a>
                </Popover>
              </Checkbox>
            </Space>
          </Col>
        </Row>
      </ExpandableOptions>

      {filter.dates ? (
        <Histogram
          issues={filteredIssues.filter(
            (issue) => !excludedIssues.includes(issue.key),
          )}
          percentiles={percentiles}
          setSelectedIssues={setSelectedIssues}
          showPercentileLabels={showPercentileLabels}
          hideOutliers={hideOutliers}
        />
      ) : null}
      <div style={{ margin: 16 }} />
      <IssuesTable
        issues={filteredIssues}
        percentiles={percentiles}
        onExcludedIssuesChanged={setExcludedIssues}
        defaultSortField="cycleTime"
      />
      <IssueDetailsDrawer
        selectedIssues={selectedIssues}
        open={selectedIssues.length > 0}
        onClose={() => setSelectedIssues([])}
      />
    </>
  );
};
