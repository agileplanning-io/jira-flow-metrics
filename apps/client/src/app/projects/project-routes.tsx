import { Link, Navigate, Route } from "react-router-dom";
import { NavigationHandle } from "../navigation/breadcrumbs";
import { issueRoutes } from "./issues/issue-routes";
import { reportRoutes } from "./reports/report-routes";
import { projectRootPath, projectsIndexPath } from "../navigation/paths";
import { ProjectsLayout } from "./projects-layout";
import { ProjectProvider } from "./context/provider";

const projectsHandle: NavigationHandle = {
  crumb({ projectId }) {
    return {
      title: projectId ? undefined : "Projects",
    };
  },
  title: ({ domain }) => domain?.host,
};

const projectHandle: NavigationHandle = {
  crumb({ project, projects }) {
    if (!projects) {
      return { title: "Loading" };
    }

    const projectOptions = projects?.map((project) => ({
      key: project.id,
      label: (
        <Link to={projectRootPath({ projectId: project.id })}>
          {project.name}
        </Link>
      ),
    }));

    const genericOptions = [
      { type: "divider" },
      {
        key: "projects",
        label: (
          <Link to={projectsIndexPath({ domainId: project?.domainId })}>
            Manage Projects
          </Link>
        ),
      },
    ];

    const items = [...projectOptions, ...genericOptions];

    const selectedKeys = project ? [project.id] : [];

    return { title: project?.name, menu: { items, selectedKeys } };
  },
};

export const projectRoutes = (
  <Route path="projects" handle={projectsHandle}>
    <Route
      path=":projectId"
      handle={projectHandle}
      element={
        <ProjectProvider>
          <ProjectsLayout />
        </ProjectProvider>
      }
    >
      {issueRoutes}
      {reportRoutes}
      <Route index element={<Navigate to="issues" />} />
    </Route>
  </Route>
);
