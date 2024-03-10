import { Route } from "react-router-dom";
import { NavigationContext } from "../../navigation/context";
import { IssuesIndexPage } from "./issues-index/issues-index-page";
import { IssueDetailsPage } from "./issue-details/issue-details-page";
import { reportsCrumb } from "../components/reports-crumb";

export const issueRoutes = (
  <Route
    path="issues"
    handle={{
      crumb: ({ projectId }: NavigationContext) =>
        reportsCrumb(projectId, "issues"),
      title: ({ project }: NavigationContext) => ["Issues", project?.name],
    }}
  >
    <Route index element={<IssuesIndexPage />} />
    <Route
      path=":issueKey"
      element={<IssueDetailsPage />}
      handle={{
        crumb: ({ issueKey }: NavigationContext) => ({ title: issueKey }),
        title: ({ project, issueKey }: NavigationContext) => [
          issueKey,
          project?.name,
        ],
      }}
    />
  </Route>
);
