import { Outlet } from "react-router-dom";
import { Breadcrumbs } from "./navigation/breadcrumbs";
import { Button, Col, Layout, Row, Space, Typography } from "antd";
import { Title } from "./navigation/title";
import { useNavigationContext } from "./navigation/context";
import { formatDate } from "@agileplanning-io/flow-lib";
import { useSyncProject } from "@data/projects";
import { useState } from "react";
import { ArrowsAltOutlined, ShrinkOutlined } from "@ant-design/icons";
import { FilterProvider } from "./filter/context/provider";

const FooterContent = () => {
  const { project } = useNavigationContext();
  const syncProject = useSyncProject();

  if (project) {
    return (
      <Space>
        <Typography.Text type="secondary">{project.name}</Typography.Text>
        &middot;
        <Typography.Text type="secondary">
          last synced: {formatDate(project.lastSync?.date) ?? "never"}
        </Typography.Text>
        &middot;
        <Button
          type="dashed"
          size="small"
          disabled={syncProject.isLoading}
          loading={syncProject.isLoading}
          onClick={() => syncProject.mutate(project?.id)}
        >
          Sync
        </Button>
      </Space>
    );
  }
};

export const AppLayout = () => {
  const [fullscreen, setFullscreen] = useState(true);
  return (
    <FilterProvider>
      <Layout
        style={{ maxWidth: fullscreen ? "1440px" : undefined, margin: "auto" }}
      >
        <Layout.Header>
          <Row>
            <Col flex="auto">
              <Breadcrumbs />
            </Col>
            <Col>
              <Button
                type="text"
                icon={fullscreen ? <ArrowsAltOutlined /> : <ShrinkOutlined />}
                onClick={() => setFullscreen(!fullscreen)}
              />
            </Col>
          </Row>
        </Layout.Header>
        <Layout.Content style={{ margin: "0 50px" }}>
          <Title />
          <Outlet />
        </Layout.Content>
        <Layout.Footer style={{ textAlign: "center" }}>
          <FooterContent />
        </Layout.Footer>
      </Layout>
    </FilterProvider>
  );
};
