import React from "react";
import { Issue } from "@agileplanning-io/flow-metrics";
import { Card, Descriptions, Space, Tag } from "antd";
import { formatTime } from "@agileplanning-io/flow-lib";
import { IssueResolution, IssueStatus } from "./issue-fields";
import { IssueExternalLinkComponent, IssueLinkComponent } from "./issue-links";
import { omit } from "remeda";

export type IssueDetailsCardProps = {
  issue: Issue;
  issuePath: string;
  parentPath?: string;
  IssueLinkComponent: IssueLinkComponent;
  IssueExternalLinkComponent: IssueExternalLinkComponent;
};

export const IssueDetailsCard: React.FC<IssueDetailsCardProps> = ({
  issue,
  issuePath,
  parentPath,
  IssueLinkComponent,
  IssueExternalLinkComponent,
}) => {
  // you shouldn't use the spread operator on an object with a key field
  const spreadableIssue = omit(issue, ["key"]);
  return (
    <Card title="Details" size="small">
      <Descriptions
        column={1}
        key={issue.key}
        colon={false}
        size="small"
        labelStyle={{ width: "35%", fontWeight: 500 }}
      >
        <Descriptions.Item label="Key">
          <Space direction="horizontal">
            <IssueLinkComponent text={issue.key} path={issuePath} />
            <IssueExternalLinkComponent externalUrl={issue.externalUrl} />
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Issue Type">
          {issue.issueType}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <IssueStatus {...spreadableIssue} />
        </Descriptions.Item>
        <Descriptions.Item label="Resolution">
          <IssueResolution {...spreadableIssue} />
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          {formatTime(issue.created)}
        </Descriptions.Item>
        {issue.parent && parentPath ? (
          <Descriptions.Item label="Parent">
            <IssueLinkComponent
              text={issue.parent.summary}
              path={parentPath}
              tag
            />
          </Descriptions.Item>
        ) : null}
        <Descriptions.Item label="Components">
          <Space>
            {issue.components.map((component) => (
              <Tag key={`component-${component}`}>{component}</Tag>
            ))}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Labels">
          <Space>
            {issue.labels.map((label) => (
              <Tag key={`label-${label}`}>{label}</Tag>
            ))}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Assignee">{issue.assignee}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
