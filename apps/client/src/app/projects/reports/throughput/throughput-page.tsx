import { useEffect, useState } from "react";
import {
  CompletedIssue,
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
import { Col, Form, Row, Select } from "antd";
import { IssuesTable } from "../../../components/issues-table";
import { useFilterContext } from "../../../filter/context";
import { ExpandableOptions } from "../../../components/expandable-options";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useProjectContext } from "../../context";
import { useSearchParams } from "react-router-dom";

export const ThroughputPage = () => {
  const { issues } = useProjectContext();
  const { filter } = useFilterContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const timeUnit = (searchParams.get("timeUnit") as TimeUnit) ?? TimeUnit.Week;

  const [filteredIssues, setFilteredIssues] = useState<CompletedIssue[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);
  const [throughputResult, setThroughputResult] = useState<ThroughputResult>();

  useEffect(() => {
    if (!filter?.dates || !issues) {
      return;
    }

    const interval: Interval = getOverlappingInterval(filter.dates, timeUnit);

    const filteredIssues = filterCompletedIssues(issues, {
      ...filter,
      dates: interval,
    });
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
          options: [{ label: "time unit", value: timeUnit }],
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
          </Col>
        </Row>
      </ExpandableOptions>
      {throughputResult ? (
        <ThroughputChart
          result={throughputResult}
          timeUnit={timeUnit}
          setSelectedIssues={setSelectedIssues}
        />
      ) : null}
      <div style={{ margin: 16 }} />
      <IssuesTable issues={selectedIssues} defaultSortField="cycleTime" />
    </>
  );
};
