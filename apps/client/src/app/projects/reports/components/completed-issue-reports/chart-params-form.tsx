import { FC } from "react";
import { Checkbox, Popover } from "antd";
import { ExportOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { ControlBar } from "@agileplanning-io/flow-components";
import { ChartParams } from "./use-chart-params";

export type ChartParamsFormOptions = {
  chartParams: ChartParams;
  setChartParams: (chartParams: ChartParams) => void;
};

export const ChartParamsForm: FC<ChartParamsFormOptions> = ({
  chartParams,
  setChartParams,
}) => (
  <ControlBar>
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
  </ControlBar>
);
