import { FC } from "react";
import { ChartParams } from "../hooks/use-chart-params";
import { ExportOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { ExpandableOptions } from "@app/components/expandable-options";
import { Row, Col, Space, Checkbox, Popover } from "antd";

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
              content={
                <span>
                  Outliers are calculated using Tukey's fence method{" "}
                  <a
                    href="https://metrics.agileplanning.io/docs/reference/report-options/#hide-outliers"
                    target="_blank"
                  >
                    <ExportOutlined />
                  </a>
                </span>
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
);
