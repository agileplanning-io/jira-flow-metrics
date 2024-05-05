import { ExpandableOptions } from "@app/components/expandable-options";
import { ChartParams } from "../hooks/use-chart-params";
import { FC } from "react";
import { Checkbox, Col, Form, Row, Select } from "antd";
import { TimeUnit } from "@agileplanning-io/flow-lib";

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
        {
          value: chartParams.showPercentileLabels
            ? "Show percentile labels"
            : "Hide percentile labels",
        },
        { label: "time unit", value: chartParams.timeUnit },
      ],
    }}
  >
    <Row gutter={[8, 8]}>
      <Col span={4}>
        <Form.Item label="Time Unit">
          <Select
            value={chartParams.timeUnit}
            onChange={(timeUnit) =>
              setChartParams({ ...chartParams, timeUnit })
            }
          >
            <Select.Option key={TimeUnit.Day}>Days</Select.Option>
            <Select.Option key={TimeUnit.Week}>Weeks</Select.Option>
            <Select.Option key={TimeUnit.Fortnight}>Fortnights</Select.Option>
            <Select.Option key={TimeUnit.Month}>Months</Select.Option>
          </Select>
        </Form.Item>
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
      </Col>
    </Row>
  </ExpandableOptions>
);
