import { useEffect, useState } from "react";
import {
  CompletedIssue,
  DateFilterType,
  HierarchyLevel,
  Issue,
  ThroughputResult,
  calculateThroughput,
  filterCompletedIssues,
} from "@agileplanning-io/flow-metrics";
import {
  Interval,
  TimeUnit,
  getOverlappingInterval,
} from "@agileplanning-io/flow-lib";
import { ThroughputChart } from "@agileplanning-io/flow-charts";
import { Checkbox, Col, Form, Row, Select } from "antd";
import { IssuesTable } from "../../../components/issues-table";
import { useFilterContext } from "../../../filter/context";
import { ExpandableOptions } from "../../../components/expandable-options";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useProjectContext } from "../../context";
import { useSearchParams } from "react-router-dom";
import { fromClientFilter } from "@app/filter/context/context";
import { useAtomValue } from "jotai";
import { chartStyleAtom } from "../chart-style";

export const ThroughputPage = () => {
  const { issues } = useProjectContext();
  const { filter } = useFilterContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const timeUnit = (searchParams.get("timeUnit") as TimeUnit) ?? TimeUnit.Week;

  const [filteredIssues, setFilteredIssues] = useState<CompletedIssue[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);
  const [throughputResult, setThroughputResult] = useState<ThroughputResult>();

  const chartStyle = useAtomValue(chartStyleAtom);

  useEffect(() => {
    if (!filter?.dates || !issues) {
      return;
    }

    const interval: Interval = getOverlappingInterval(filter.dates, timeUnit);

    const filteredIssues = filterCompletedIssues(
      issues,
      fromClientFilter(
        { ...filter, dates: interval },
        DateFilterType.Completed,
      ),
    );
    setFilteredIssues(filteredIssues);

    setThroughputResult(
      calculateThroughput({
        issues: filteredIssues,
        interval,
        timeUnit,
      }),
    );
  }, [filter, timeUnit, issues]);

  const onTimeUnitChanged = (timeUnit: TimeUnit) => {
    setSearchParams((prev) => {
      prev.set("timeUnit", timeUnit);
      return prev;
    });
  };

  const showPercentileLabels =
    searchParams.get("showPercentileLabels") === "true";
  const setShowPercentileLabels = (showPercentileLabels: boolean) =>
    setSearchParams((prev) => {
      prev.set("showPercentileLabels", showPercentileLabels.toString());
      return prev;
    });

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

      <ExpandableOptions
        header={{
          title: "Chart Options",
          options: [
            {
              value: showPercentileLabels
                ? "Show percentile labels"
                : "Hide percentile labels",
            },
            { label: "time unit", value: timeUnit },
          ],
        }}
      >
        <Row gutter={[8, 8]}>
          <Col span={4}>
            <Form.Item label="Time Unit">
              <Select value={timeUnit} onChange={onTimeUnitChanged}>
                <Select.Option key={TimeUnit.Day}>Days</Select.Option>
                <Select.Option key={TimeUnit.Week}>Weeks</Select.Option>
                <Select.Option key={TimeUnit.Fortnight}>
                  Fortnights
                </Select.Option>
                <Select.Option key={TimeUnit.Month}>Months</Select.Option>
              </Select>
            </Form.Item>
            <Checkbox
              checked={showPercentileLabels}
              onChange={(e) => setShowPercentileLabels(e.target.checked)}
            >
              Show percentile labels
            </Checkbox>
          </Col>
        </Row>
      </ExpandableOptions>
      {throughputResult ? (
        <ThroughputChart
          result={throughputResult}
          timeUnit={timeUnit}
          setSelectedIssues={setSelectedIssues}
          style={chartStyle}
          showPercentileLabels={showPercentileLabels}
        />
      ) : null}
      <div style={{ margin: 16 }} />
      <IssuesTable issues={selectedIssues} defaultSortField="cycleTime" />
    </>
  );
};
