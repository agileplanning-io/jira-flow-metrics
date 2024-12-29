import { ChartParams } from "./use-chart-params";
import { FC } from "react";
import { Checkbox } from "antd";
import { TimeUnit } from "@agileplanning-io/flow-lib";
import {
  ControlBar,
  Dropdown,
  DropdownItemType,
  FormControl,
} from "@agileplanning-io/flow-components";

export type ChartParamsFormOptions = {
  chartParams: NonNullable<ChartParams>;
  setChartParams: (chartParams: ChartParams) => void;
};

export const ChartParamsForm: FC<ChartParamsFormOptions> = ({
  chartParams,
  setChartParams,
}) => {
  const timeUnitItems: DropdownItemType<TimeUnit>[] = [
    { label: "Days", key: TimeUnit.Day },
    { label: "Weeks", key: TimeUnit.Week },
    { label: "Fortnights", key: TimeUnit.Fortnight },
    { label: "Months", key: TimeUnit.Month },
  ];

  const onTimeUnitSelected = (timeUnit: TimeUnit) =>
    setChartParams({ ...chartParams, timeUnit });

  return (
    <ControlBar>
      <FormControl label="Time unit">
        <Dropdown
          items={timeUnitItems}
          selectedKey={chartParams.timeUnit}
          onItemSelected={onTimeUnitSelected}
        />
      </FormControl>

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
    </ControlBar>
  );
};
