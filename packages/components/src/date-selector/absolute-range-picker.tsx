import { AbsoluteInterval } from "@agileplanning-io/flow-lib";
import { SizeType } from "antd/es/config-provider/SizeContext";
import { endOfDay } from "date-fns";
import { FC } from "react";
import { DatePicker } from "./date-picker";

export const AbsoluteRangePicker: FC<{
  dates: AbsoluteInterval;
  onChange: (interval: AbsoluteInterval) => void;
  size?: SizeType;
}> = ({ dates, onChange, size }) => (
  <DatePicker.RangePicker
    size={size}
    suffixIcon={false}
    style={{ width: "100%", zIndex: 10000 }}
    allowClear={false}
    value={[dates.start, dates.end]}
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
