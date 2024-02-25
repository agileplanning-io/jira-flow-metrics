import { FC } from "react";
import { Issue } from "@agileplanning-io/flow-metrics";
import { Tag } from "antd";
import { categoryColors } from "./category-colors";

export const IssueStatus: FC<Pick<Issue, "status" | "statusCategory">> = ({
  status,
  statusCategory,
}) => <Tag color={categoryColors[statusCategory]}>{status}</Tag>;

export const IssueResolution: FC<Pick<Issue, "resolution">> = ({
  resolution,
}) => (resolution === undefined ? null : <Tag color="green">{resolution}</Tag>);
