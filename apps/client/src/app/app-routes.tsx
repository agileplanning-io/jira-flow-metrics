import { Link, Navigate, Route } from "react-router-dom";
import { NavigationHandle } from "./navigation/breadcrumbs";
import { domainRoutes } from "./domains/domain-routes";
import { projectRoutes } from "./projects/project-routes";
import { AppLayout } from "./app-layout";
import { projectsIndexPath } from "./navigation/paths";

const rootHandle: NavigationHandle = {
  crumb({ domain, domains, path }) {
    if (path === "/domains") {
      return;
    }

    if (!domains) {
      return { title: "Loading" };
    }

    if (domain) {
      const domainOptions = domains.map((domain) => ({
        key: domain.id,
        label: (
          <Link to={projectsIndexPath({ domainId: domain.id })}>
            {domain.host}
          </Link>
        ),
      }));

      const genericOptions = [
        { type: "divider" },
        { key: "domains", label: <Link to="/domains">Manage Domains</Link> },
      ];

      const items = [...domainOptions, ...genericOptions];
      const selectedKeys = domain ? [domain.id] : [];

      return { title: domain.host, menu: { items, selectedKeys } };
    }
  },
};

export const appRoutes = (
  <Route path="/" element={<AppLayout />} handle={rootHandle}>
    <Route index element={<Navigate to="/domains" />} />
    {domainRoutes}
    {projectRoutes}
  </Route>
);
