import { useEffect, useState } from "react";
import {
  CompletedIssue,
  Issue,
  filterCompletedIssues,
} from "../../../data/issues";
import { Interval, TimeUnit } from "../../../lib/intervals";
import { ThroughputChart } from "./components/throughput-chart";
import { Col, Form, Row, Select } from "antd";
import { ThroughputResult, calculateThroughput } from "../../../lib/throughput";
import { IssuesTable } from "../../../components/issues-table";
import { useFilterContext } from "../../../filter/context";
import { ExpandableOptions } from "../../../components/expandable-options";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { useDatasetContext } from "../../context";

export const ThroughputPage = () => {
  const { issues } = useDatasetContext();

  const { filter } = useFilterContext();

  const [timeUnit, setTimeUnit] = useState<TimeUnit>(TimeUnit.Day);

  const [filteredIssues, setFilteredIssues] = useState<CompletedIssue[]>([]);

  const [selectedIssues, setSelectedIssues] = useState<Issue[]>([]);

  useEffect(() => {
    if (filter && issues) {
      const filteredIssues = filterCompletedIssues(issues, filter);
      setFilteredIssues(filteredIssues);
    }
  }, [issues, filter, setFilteredIssues]);

  const [throughputResult, setThroughputResult] = useState<ThroughputResult>();

  useEffect(() => {
    if (!filter || !filter.dates || !filter.dates[0] || !filter.dates[1]) {
      return;
    }

    const interval: Interval = { start: filter.dates[0], end: filter.dates[1] };

    setThroughputResult(
      calculateThroughput({
        issues: filteredIssues,
        interval,
        timeUnit,
      }),
    );
  }, [filter, timeUnit, filteredIssues]);

  return (
    <>
      <FilterOptionsForm
        issues={issues}
        filteredIssuesCount={filteredIssues.length}
        showDateSelector={true}
        showStatusFilter={false}
        showResolutionFilter={true}
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
              <Select value={timeUnit} onChange={setTimeUnit}>
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
      <IssuesTable issues={selectedIssues} defaultSortField="cycleTime" />
    </>
  );
};