import { Button, Drawer, Layout, Space } from "antd";
import React, { ReactElement, useState } from "react";
import { HierarchyLevel, Issue } from "@jbrunton/flow-metrics";
import {
  IssueDetailsCard,
  IssueMetricsCard,
  IssueTransitionsCard,
} from "@jbrunton/flow-components";
import { useNavigationContext } from "@app/navigation/context";
import { issueDetailsPath } from "@app/navigation/paths";
import {
  IssueExternalLink,
  IssueLink,
} from "@app/datasets/components/issue-links";
import { useDatasetContext } from "@app/datasets/context";
import { IssuesTable } from "@app/components/issues-table";
import { ZoomInOutlined } from "@ant-design/icons";
import { EpicTimeline } from "@app/datasets/issues/issue-details/components/epic-timeline";

const IssueDetails = ({ issue }: { issue: Issue }): ReactElement => {
  const { datasetId } = useNavigationContext();
  const { issues } = useDatasetContext();

  const issueKey = issue.key;
  const issuePath = issueDetailsPath({ issueKey: issue.key, datasetId });
  const parentPath = issue.parentKey
    ? issueDetailsPath({
        issueKey: issue.parentKey,
        datasetId,
      })
    : undefined;

  const isEpic = issue?.hierarchyLevel === HierarchyLevel.Epic;
  const children = isEpic
    ? issues?.filter((issue) => issue.parentKey === issueKey)
    : undefined;

  const [showTimeline, setShowTimeline] = useState(false);

  return (
    <>
      <h2>{issue.summary}</h2>
      <Space direction="vertical">
        <IssueDetailsCard
          issue={issue}
          issuePath={issuePath}
          parentPath={parentPath}
          IssueLinkComponent={IssueLink}
          IssueExternalLinkComponent={IssueExternalLink}
        />
        <IssueMetricsCard issue={issue} />
        <IssueTransitionsCard issue={issue} />
        {isEpic ? (
          <>
            <Button
              style={{ float: "right" }}
              type="link"
              icon={<ZoomInOutlined />}
              onClick={() => setShowTimeline(true)}
            >
              Timeline
            </Button>
            <IssuesTable
              issues={children ?? []}
              parentEpic={issue}
              flowMetricsOnly={true}
              defaultSortField="started"
            />
            <Drawer
              title="Timeline"
              placement="bottom"
              onClose={() => setShowTimeline(false)}
              open={showTimeline}
              push={false}
              height="100%"
            >
              <Layout style={{ maxWidth: "1440px", margin: "auto" }}>
                <Layout.Content style={{ margin: "0 50px" }}>
                  <EpicTimeline issues={children ?? []} epic={issue} />
                </Layout.Content>
              </Layout>
            </Drawer>
          </>
        ) : null}
      </Space>
    </>
  );
};

export type IssueDetailsDrawerProps = {
  selectedIssues: Issue[];
  open: boolean;
  onClose: () => void;
};

export const IssueDetailsDrawer: React.FC<IssueDetailsDrawerProps> = ({
  selectedIssues,
  open,
  onClose,
}) => (
  <Drawer
    placement="right"
    width="800px"
    closable={false}
    onClose={onClose}
    open={open}
  >
    {selectedIssues.map((issue) => (
      <IssueDetails key={issue.key} issue={issue} />
    ))}
  </Drawer>
);
