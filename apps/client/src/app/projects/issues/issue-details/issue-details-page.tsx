import { Button, Col, Drawer, Layout, Row, Space } from "antd";
import { HierarchyLevel } from "@agileplanning-io/flow-metrics";
import { useNavigationContext } from "../../../navigation/context";
import {
  IssueDetailsCard,
  IssueMetricsCard,
  IssueTransitionsCard,
} from "@agileplanning-io/flow-components";
import { useProjectContext } from "../../context";
import { useState } from "react";
import { ZoomInOutlined } from "@ant-design/icons";
import { issueDetailsPath } from "@app/navigation/paths";
import {
  IssueExternalLink,
  IssueLink,
} from "@app/projects/components/issue-links";
import { EpicTimelinePage } from "./components/epic-timeline-page";
import { IssuesTable } from "@app/components/issues-table";

export const IssueDetailsPage = () => {
  const { issueKey, projectId } = useNavigationContext();
  const { issues } = useProjectContext();
  const issue = issues?.find((issue) => issue.key === issueKey);
  const isEpic = issue?.hierarchyLevel === HierarchyLevel.Epic;
  const children = isEpic
    ? issues?.filter((issue) => issue.parentKey === issueKey)
    : undefined;
  const [showTimeline, setShowTimeline] = useState(false);
  const issuePath = issueDetailsPath({ issueKey, projectId });
  const parentPath = issue?.parentKey
    ? issueDetailsPath({ issueKey: issue.parentKey, projectId })
    : undefined;
  return issue ? (
    <>
      <h2>{issue.summary}</h2>
      <Row gutter={[8, 8]}>
        <Col md={12} sm={24}>
          <Space direction="vertical">
            <IssueDetailsCard
              issue={issue}
              issuePath={issuePath}
              parentPath={parentPath}
              IssueLinkComponent={IssueLink}
              IssueExternalLinkComponent={IssueExternalLink}
            />
          </Space>
        </Col>
        <Col md={12} sm={24}>
          <Space direction="vertical">
            <IssueMetricsCard issue={issue} />
            <IssueTransitionsCard issue={issue} />
          </Space>
        </Col>
      </Row>
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
                <EpicTimelinePage issues={children ?? []} epic={issue} />
              </Layout.Content>
            </Layout>
          </Drawer>
        </>
      ) : null}
    </>
  ) : null;
};
