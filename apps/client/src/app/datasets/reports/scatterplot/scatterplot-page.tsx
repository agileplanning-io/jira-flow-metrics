import { Issue, filterCompletedIssues } from "@agileplanning-io/flow-metrics";
import {
  Scatterplot,
  getCycleTimePercentiles,
} from "@agileplanning-io/flow-charts";
import { useMemo, useState } from "react";
import { IssueDetailsDrawer } from "../components/issue-details-drawer";
import { IssuesTable } from "../../../components/issues-table";
import { useFilterContext } from "../../../filter/context";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useDatasetContext } from "../../context";
import { Checkbox, Col, Popover, Row, Space } from "antd";
import { ExpandableOptions } from "../../../components/expandable-options";
import { useSearchParams } from "react-router-dom";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { z } from "zod";
import { useParam, useParams } from "@lib/params";

const scatterplotParams = z.object({
  showPercentileLabels: z.boolean().default(false),
  hideOutliers: z.boolean().default(false),
});

export const ScatterplotPage = () => {
  const { issues } = useDatasetContext();

  const { filter } = useFilterContext();
  const [excludedIssues, setExcludedIssues] = useState<string[]>([]);

  const [params, setParams] = useParams(scatterplotParams);
  const [showPercentileLabels, setShowPercentileLabels] = useParam(
    params,
    setParams,
    "showPercentileLabels",
  );

  const hideOutliers = params.hideOutliers;
  const setHideOutliers = (hideOutliers: boolean) =>
    setParams({
      ...params,
      hideOutliers,
    });

  const [filteredIssues, percentiles] = useMemo(() => {
    if (issues && filter) {
      const filteredIssues = filterCompletedIssues(issues, filter);
      const percentiles = getCycleTimePercentiles(
        filteredIssues.filter((issue) => !excludedIssues.includes(issue.key)),
      );
      return [filteredIssues, percentiles];
    }
    return [[], []];
  }, [issues, filter, excludedIssues]);

  const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);

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
        <Scatterplot
          issues={filteredIssues.filter(
            (issue) => !excludedIssues.includes(issue.key),
          )}
          percentiles={percentiles}
          range={filter.dates}
          setSelectedIssues={setSelectedIssues}
          showPercentileLabels={showPercentileLabels}
          hideOutliers={hideOutliers}
        />
      ) : null}

      <div style={{ margin: 16 }} />
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
