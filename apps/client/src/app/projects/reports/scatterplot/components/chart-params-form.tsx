import { FC } from "react";
import { ChartParams } from "../hooks/use-chart-params";
import { ExpandableOptions } from "@app/components/expandable-options";
import { Checkbox, Col, Popover, Row, Space } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

export type ChartParamsFormOptions = {
  chartParams: ChartParams;
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
        {
          value: chartParams.hideOutliers ? "Hide outliers" : "Show outliers",
        },
      ],
    }}
  >
    <Row gutter={[8, 8]}>
      <Col span={6}>
        <Space direction="vertical">
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
          <Checkbox
            checked={chartParams.hideOutliers}
            onChange={(e) =>
              setChartParams({
                ...chartParams,
                hideOutliers: e.target.checked,
              })
            }
          >
            Hide outliers
            <Popover
              placement="right"
              content={"Outliers are calculated using the Tukey Fence method"}
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
);
