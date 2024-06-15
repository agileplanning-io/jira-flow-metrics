import generatePicker from "antd/lib/date-picker/generatePicker";
import dateFnsGenerateConfig from "rc-picker/lib/generate/dateFns";

export const DatePicker = generatePicker<Date>(dateFnsGenerateConfig);
