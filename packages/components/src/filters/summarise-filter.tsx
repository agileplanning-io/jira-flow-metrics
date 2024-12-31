import { ellipsize } from "@agileplanning-io/flow-lib";
import {
  IssueAttributesFilter,
  ValuesFilter,
  FilterType,
} from "@agileplanning-io/flow-metrics";
import { Typography } from "antd";
import { ReactNode } from "react";
import { compact } from "remeda";

export const summariseFilter = (filter: IssueAttributesFilter): ReactNode => {
  const summary: (string | undefined)[] = [];

  const summariseValuesFilter = (name: string, valuesFilter?: ValuesFilter) => {
    if (!valuesFilter?.values?.length) {
      return undefined;
    }

    const op =
      valuesFilter.values.length === 1
        ? valuesFilter.type === FilterType.Include
          ? "="
          : "!="
        : valuesFilter.type === FilterType.Include
          ? "in"
          : "excl.";

    return `${name} ${op} ${valuesFilter.values.join(",")}`;
  };

  summary.push(summariseValuesFilter("Resolution", filter.resolutions));
  summary.push(summariseValuesFilter("Labels", filter.labels));
  summary.push(summariseValuesFilter("Components", filter.components));
  summary.push(summariseValuesFilter("Issue Type", filter.issueTypes));
  summary.push(summariseValuesFilter("Assignees", filter.assignees));
  summary.push(summariseValuesFilter("Statuses", filter.statuses));

  if (compact(summary).length === 0) {
    return (
      <Typography.Text type="secondary">No filter applied</Typography.Text>
    );
  }

  return ellipsize(compact(summary).join(", "), 48);
};
