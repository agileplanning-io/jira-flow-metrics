import { AbsoluteInterval } from "@agileplanning-io/flow-lib";
import { SizeType } from "antd/es/config-provider/SizeContext";
import { endOfDay } from "date-fns";
import { FC } from "react";
import { DatePicker } from "./date-picker";

type AbsoluteRangePickerProps = {
  dates?: AbsoluteInterval;
  onChange: (interval: AbsoluteInterval) => void;
  size?: SizeType;
  allowClear?: boolean;
};

export const AbsoluteRangePicker: FC<AbsoluteRangePickerProps> = ({
  dates,
  onChange,
  size,
  allowClear,
}) => (
  <DatePicker.RangePicker
    size={size}
    suffixIcon={false}
    style={{ width: "100%", zIndex: 10000 }}
    allowClear={allowClear}
    value={[dates?.start, dates?.end]}
    onChange={(range) => {
      if (range) {
        const [start, end] = range;
        if (start && end) {
          onChange({ start, end: endOfDay(end) });
        }
      }
    }}
  />
);
