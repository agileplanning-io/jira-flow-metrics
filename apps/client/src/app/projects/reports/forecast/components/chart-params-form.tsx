import { ExpandableOptions } from "@app/components/expandable-options";
import { ChartParams, newSeed } from "../hooks/use-chart-params";
import { FC } from "react";
import { formatDate } from "@agileplanning-io/flow-lib";
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
import { DatePicker } from "@agileplanning-io/flow-components";
import { RedoOutlined } from "@ant-design/icons";

export type ChartParamsFormOptions = {
  chartParams: NonNullable<ChartParams>;
  setChartParams: (chartParams: ChartParams) => void;
};

export const ChartParamsForm: FC<ChartParamsFormOptions> = ({
  chartParams,
  setChartParams,
}) => (
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
          value: chartParams.includeLeadTimes
            ? "Include lead times"
            : "Exclude lead times",
        },
        {
          value: chartParams.excludeOutliers
            ? "Exclude cycle time outliers"
            : "Include cycle time outliers",
        },
        {
          value: chartParams.showPercentileLabels
            ? "Show percentile labels"
            : "Hide percentile labels",
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
              allowClear={true}
              onChange={(e) => {
                setChartParams({
                  ...chartParams,
                  startDate: e ?? undefined,
                });
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
              <Tooltip title="New seed">
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
            checked={chartParams.includeLeadTimes}
            onChange={(e) =>
              setChartParams({
                ...chartParams,
                includeLeadTimes: e.target.checked,
              })
            }
          >
            Include lead times
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
        </Space>
      </Row>
    </Form>
  </ExpandableOptions>
);
