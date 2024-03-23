import {
  DeleteOutlined,
  PlusOutlined,
  SettingOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Button, Drawer, Space, Table } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AddProjectModal } from "./add-project-modal";
import { Project, useSyncProject } from "@data/projects";
import {
  ageingWipPath,
  forecastPath,
  histogramPath,
  issuesIndexPath,
  scatterplotPath,
  throughputPath,
  timeSpentPath,
  wipPath,
} from "../../navigation/paths";
import { RemoveProjectModal } from "./remove-project-modal";
import { formatDate } from "@agileplanning-io/flow-lib";
import { useNavigationContext } from "../../navigation/context";
import { EditProjectForm } from "./edit-project-form";

export const ProjectsIndexPage = () => {
  const { domainId } = useNavigationContext();
  const [showAddProjectForm, setShowAddProjectForm] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project>();
  const [projectToRemove, setProjectToRemove] = useState<Project>();

  const [loadingProjectId, setLoadingProjectId] = useState<string>();

  const { projects } = useNavigationContext();

  const dataSource = projects?.map((project) => ({
    key: project.id,
    ...project,
  }));

  const syncProject = useSyncProject();

  const syncSelectedProject = (project: Project) => {
    syncProject.mutate(project.id);
    setLoadingProjectId(project.id);
  };

  useEffect(() => {
    if (!syncProject.isLoading) {
      setLoadingProjectId(undefined);
    }
  }, [syncProject.isLoading, setLoadingProjectId]);

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setShowAddProjectForm(true)}
        style={{ marginBottom: "16px" }}
      >
        Add Project
      </Button>

      <Table
        dataSource={dataSource}
        columns={[
          { title: "Name", dataIndex: "name", key: "name" },
          {
            title: "Issues",
            key: "issues",
            render: (_, project) => (
              <Link to={issuesIndexPath({ projectId: project.id })}>
                Issues{" "}
                {project.lastSync ? (
                  <span>({project.lastSync.issueCount})</span>
                ) : null}
              </Link>
            ),
          },
          {
            title: "Flow Metrics",
            key: "flow-metrics",
            render: (_, project) => (
              <Space size="large">
                <Link to={scatterplotPath({ projectId: project.id })}>
                  Scatterplot
                </Link>
                <Link to={histogramPath({ projectId: project.id })}>
                  Histogram
                </Link>
                <Link to={throughputPath({ projectId: project.id })}>
                  Throughput
                </Link>
                <Link to={wipPath({ projectId: project.id })}>WIP</Link>
                <Link to={ageingWipPath({ projectId: project.id })}>
                  Ageing WIP
                </Link>
              </Space>
            ),
          },
          {
            title: "Planning",
            key: "planning",
            render: (_, project) => (
              <Space size="large">
                <Link to={forecastPath({ projectId: project.id })}>
                  Forecast
                </Link>
                <Link to={timeSpentPath({ projectId: project.id })}>
                  Time Spent
                </Link>
              </Space>
            ),
          },

          {
            title: "Sync",
            key: "sync",
            render: (_, project) => (
              <Space size="large">
                <Button
                  icon={<SyncOutlined />}
                  onClick={() => syncSelectedProject(project)}
                  disabled={loadingProjectId !== undefined}
                  loading={
                    syncProject.isLoading && project.id === loadingProjectId
                  }
                >
                  Sync
                </Button>
                <span>
                  Last synced:{" "}
                  {project.lastSync
                    ? formatDate(project.lastSync.date)
                    : "never"}
                </span>
              </Space>
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, project) => (
              <Space>
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => setProjectToEdit(project)}
                  disabled={
                    loadingProjectId !== undefined ||
                    project?.lastSync === undefined
                  }
                />
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => setProjectToRemove(project)}
                  disabled={loadingProjectId !== undefined}
                />
              </Space>
            ),
          },
        ]}
      />

      <AddProjectModal
        isOpen={showAddProjectForm}
        close={() => setShowAddProjectForm(false)}
        domainId={domainId}
      />
      <RemoveProjectModal
        project={projectToRemove}
        isOpen={projectToRemove !== undefined}
        close={() => setProjectToRemove(undefined)}
      />
      <Drawer
        size="large"
        placement="bottom"
        title={`Edit ${projectToEdit?.name}`}
        open={projectToEdit !== undefined}
        style={{ overflow: "hidden" }}
        height="100%"
        onClose={() => setProjectToEdit(undefined)}
      >
        {projectToEdit ? (
          <EditProjectForm
            project={projectToEdit}
            onClose={() => setProjectToEdit(undefined)}
          />
        ) : null}
      </Drawer>
    </>
  );
};
