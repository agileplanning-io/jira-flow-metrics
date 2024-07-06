import {
  IssuesTable as IssuesTableComponent,
  IssuesTableProps,
} from "@agileplanning-io/flow-components";
import { useNavigationContext } from "@app/navigation/context";
import { issueDetailsPath } from "@app/navigation/paths";
import {
  IssueExternalLink,
  IssueLink,
} from "@app/projects/components/issue-links";
import { IssueDetailsDrawer } from "@app/projects/reports/components/issue-details-drawer";
import { FC } from "react";

export const IssuesTable: FC<
  Omit<
    IssuesTableProps,
    "IssueLink" | "IssueExternalLink" | "IssueDetailsDrawer" | "getIssuePath"
  >
> = (params) => {
  const { projectId } = useNavigationContext();
  return (
    <IssuesTableComponent
      {...params}
      IssueLink={IssueLink}
      IssueExternalLink={IssueExternalLink}
      IssueDetailsDrawer={IssueDetailsDrawer}
      getIssuePath={(issueKey) => issueDetailsPath({ projectId, issueKey })}
    />
  );
};
