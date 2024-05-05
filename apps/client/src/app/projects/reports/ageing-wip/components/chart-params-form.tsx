import { FC } from "react";
import { ChartParams } from "../hooks/use-chart-params";
import { ExpandableOptions } from "@app/components/expandable-options";
import { Checkbox, Col, Row } from "antd";

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
          value: chartParams.includeStoppedIssues
            ? "Include stopped issues"
            : "Exclude stopped issues",
        },
        {
          value: chartParams.showPercentileLabels
            ? "Show percentile labels"
            : "Hide percentile labels",
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
      </Col>
    </Row>
  </ExpandableOptions>
);
