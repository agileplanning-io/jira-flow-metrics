import { useEffect, useState } from "react";
import {
  HierarchyLevel,
  Issue,
  WipResult,
  WipType,
  calculateWip,
  filterIssues,
} from "@agileplanning-io/flow-metrics";
import { IssuesTable } from "../../../components/issues-table";
import { WipChart } from "@agileplanning-io/flow-charts/src/wip/wip-chart";
import { omit } from "remeda";
import { Checkbox, Col, Form, Radio, Row } from "antd";
import { useProjectContext } from "../../context";
import { ExpandableOptions } from "../../../components/expandable-options";
import { useAtomValue } from "jotai";
import { chartStyleAtom } from "../chart-style";
import { useChartParams } from "./hooks/use-chart-params";
import { useFilterParams } from "@app/filter/use-filter-params";
import { asAbsolute, defaultDateRange } from "@agileplanning-io/flow-lib";
import { IssueFilterForm, ReportType } from "@agileplanning-io/flow-components";

export const WipPage = () => {
  const { issues } = useProjectContext();
  const { filter, setFilter } = useFilterParams({
    dates: defaultDateRange(),
    hierarchyLevel: HierarchyLevel.Story,
  });

  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);

  const chartStyle = useAtomValue(chartStyleAtom);

  const { chartParams, setChartParams } = useChartParams();

  useEffect(() => {
    // reset the selected issue list if we change the filter
    setSelectedIssues([]);
  }, [filter, chartParams.includeStoppedIssues]);

  useEffect(() => {
    if (filter && issues) {
      const filteredIssues = filterIssues(issues, omit(filter, ["dates"]));
      setFilteredIssues(filteredIssues);
    }
  }, [issues, filter, setFilteredIssues]);

  const [wipResult, setWipResult] = useState<WipResult>();

  useEffect(() => {
    if (!filter?.dates) {
      return;
    }

    setWipResult(
      calculateWip({
        issues: filteredIssues,
        range: asAbsolute(filter.dates),
        includeStoppedIssues: chartParams.includeStoppedIssues,
        wipType: chartParams.wipType,
      }),
    );
  }, [
    filter,
    filteredIssues,
    chartParams.includeStoppedIssues,
    chartParams.wipType,
  ]);

  return (
    <>
      <IssueFilterForm
        issues={issues}
        filteredIssuesCount={filteredIssues.length}
        filter={filter}
        setFilter={setFilter}
        reportType={ReportType.Wip}
        showHierarchyFilter={true}
      />

      <ExpandableOptions
        header={{
          title: "Chart Options",
          options: [
            {
              value: chartParams.includeStoppedIssues
                ? "Include stopped issues"
                : "Exclude stopped issues",
            },
            {
              value: chartParams.showPercentileLabels
                ? "Show percentile labels"
                : "Hide percentile labels",
            },
            {
              value:
                chartParams.wipType === WipType.LeadTime
                  ? "Lead time"
                  : "Status",
            },
          ],
        }}
      >
        <Row gutter={[8, 8]}>
          <Col span={6}>
            <Checkbox
              checked={chartParams.includeStoppedIssues}
              onChange={(e) =>
                setChartParams({
                  ...chartParams,
                  includeStoppedIssues: e.target.checked,
                })
              }
            >
              Include stopped issues
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
              Show percentile labels
            </Checkbox>
            <Form.Item label="WIP algorithm" style={{ width: "100%" }}>
              <Radio.Group
                value={chartParams.wipType}
                onChange={(e) =>
                  setChartParams({
                    ...chartParams,
                    wipType: e.target.value,
                  })
                }
              >
                <Radio value={WipType.Status}>Status</Radio>
                <Radio value={WipType.LeadTime}>Lead time</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
      </ExpandableOptions>

      {wipResult ? (
        <WipChart
          result={wipResult}
          setSelectedIssues={setSelectedIssues}
          showPercentileLabels={chartParams.showPercentileLabels}
          style={chartStyle}
        />
      ) : null}
      <div style={{ margin: 16 }} />
      <IssuesTable issues={selectedIssues} defaultSortField="cycleTime" />
    </>
  );
};
