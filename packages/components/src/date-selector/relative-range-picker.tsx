import { RelativeInterval, TimeUnit } from "@agileplanning-io/flow-lib";
import { Select, InputNumber, SelectProps } from "antd";
import { FC } from "react";
import { isNumber } from "remeda";

export const RelativeRangePicker: FC<{
  dates: RelativeInterval;
  onChange: (interval: RelativeInterval) => void;
}> = ({ dates, onChange }) => {
  const select = (
    <Select
      style={{ width: "140px" }}
      options={timeUnitOptions}
      value={dates.unit}
      onChange={(unit) => onChange({ ...dates, unit })}
    />
  );
  return (
    <InputNumber
      type="number"
      addonAfter={select}
      style={{ width: "100%" }}
      value={dates.unitCount}
      onChange={(unitCount) => {
        if (isNumber(unitCount)) {
          onChange({ ...dates, unitCount });
        }
      }}
    />
  );
};

const timeUnitOptions: SelectProps["options"] = [
  TimeUnit.Day,
  TimeUnit.Week,
  TimeUnit.Fortnight,
  TimeUnit.Month,
].map((unit) => ({ label: `${unit}s ago`, value: unit }));
