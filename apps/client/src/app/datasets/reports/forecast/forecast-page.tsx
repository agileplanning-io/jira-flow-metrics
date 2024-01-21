import { useEffect, useState } from "react";
import { CompletedIssue, filterCompletedIssues } from "@jbrunton/flow-metrics";
import { useFilterContext } from "../../../filter/context";
import { ForecastChart } from "./components/forecast-chart";
import {
  Button,
  Checkbox,
  Col,
  Form,
  InputNumber,
  Row,
  Space,
  Tooltip,
} from "antd";
import { DatePicker } from "../components/date-picker";
import { RedoOutlined } from "@ant-design/icons";
import { FilterOptionsForm } from "../components/filter-form/filter-options-form";
import { ExpandableOptions } from "../../../components/expandable-options";
import { useDatasetContext } from "../../context";
import { formatDate } from "@jbrunton/flow-lib";
import { SummaryRow, forecast } from "@usecases/forecast/forecast";
import { newSeed, useForecastChartParams } from "./hooks/use-chart-params";

export const ForecastPage = () => {
  const { issues } = useDatasetContext();

  const { filter } = useFilterContext();

  const [filteredIssues, setFilteredIssues] = useState<CompletedIssue[]>([]);

  const { chartParams, setChartParams } = useForecastChartParams();

  useEffect(() => {
    if (filter && issues) {
      const filteredIssues = filterCompletedIssues(issues, filter).sort(
        (i1, i2) =>
          i1.metrics.completed.getTime() - i2.metrics.completed.getTime(),
      );
      setFilteredIssues(filteredIssues);
    }
  }, [issues, filter, setFilteredIssues]);

  const [summary, setSummary] = useState<SummaryRow[]>();

  useEffect(() => {
    if (!filteredIssues || filteredIssues.length === 0) return;
    const result = forecast({
      selectedIssues: filteredIssues,
      ...chartParams,
    });
    setSummary(result);
  }, [filteredIssues, filter, chartParams]);

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
            { label: "Issue count", value: chartParams.issueCount.toString() },
            {
              label: "Start date",
              value: formatDate(chartParams.startDate) ?? "-",
            },
            { label: "Seed", value: chartParams.seed.toString() },
            {
              value: chartParams.includeLongTail
                ? "Include long tail"
                : "Exclude long tail",
            },
            {
              value: chartParams.excludeLeadTimes
                ? "Exclude lead times"
                : "Include lead times",
            },
            {
              value: chartParams.excludeOutliers
                ? "Exclude cycle time outliers"
                : "Include cycle time outliers",
            },
          ],
        }}
      >
        <Form layout="vertical">
          <Row gutter={[8, 8]}>
            <Col span={2}>
              <Form.Item label="Issue count">
                <InputNumber
                  style={{ width: "100%" }}
                  value={chartParams.issueCount}
                  onChange={(e) => {
                    if (e) {
                      setChartParams({ ...chartParams, issueCount: e });
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Start date">
                <DatePicker
                  style={{ width: "100%" }}
                  value={chartParams.startDate}
                  allowClear={false}
                  onChange={(e) => {
                    if (e) {
                      setChartParams({ ...chartParams, startDate: e });
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Seed">
                <Space.Compact style={{ width: "100%" }}>
                  <InputNumber
                    style={{ width: "100%" }}
                    value={chartParams.seed}
                    onChange={(e) => {
                      if (e) {
                        setChartParams({ ...chartParams, seed: e });
                      }
                    }}
                  />
                  <Tooltip title="Refresh">
                    <Button
                      icon={
                        <RedoOutlined
                          onClick={() =>
                            setChartParams({ ...chartParams, seed: newSeed() })
                          }
                        />
                      }
                    />
                  </Tooltip>
                </Space.Compact>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Space direction="vertical">
              <Checkbox
                checked={chartParams.includeLongTail}
                onChange={(e) =>
                  setChartParams({
                    ...chartParams,
                    includeLongTail: e.target.checked,
                  })
                }
              >
                Include long tail
              </Checkbox>
              <Checkbox
                checked={chartParams.excludeLeadTimes}
                onChange={(e) =>
                  setChartParams({
                    ...chartParams,
                    excludeLeadTimes: e.target.checked,
                  })
                }
              >
                Exclude lead times
              </Checkbox>
              <Checkbox
                checked={chartParams.excludeOutliers}
                onChange={(e) =>
                  setChartParams({
                    ...chartParams,
                    excludeOutliers: e.target.checked,
                  })
                }
              >
                Exclude cycle time outliers
              </Checkbox>
            </Space>
          </Row>
        </Form>
      </ExpandableOptions>
      <ForecastChart summary={summary ?? []} />
    </>
  );
};
