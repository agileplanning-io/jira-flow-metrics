import { Route } from "react-router-dom";
import { DomainsIndexPage } from "./domains-index-page";
import { NavigationContext } from "../navigation/context";
import { ProjectsIndexPage } from "@app/projects/index/projects-index-page";

export const domainRoutes = (
  <Route path="domains">
    <Route index element={<DomainsIndexPage />} handle={{ title: "Domains" }} />
    <Route
      path=":domainId/projects"
      element={<ProjectsIndexPage />}
      index
      handle={{
        title: ({ domain }: NavigationContext) => ["Projects", domain?.host],
      }}
    />
  </Route>
);
