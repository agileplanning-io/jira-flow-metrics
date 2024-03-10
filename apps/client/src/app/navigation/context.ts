import { useLocation, useParams } from "react-router-dom";
import { Project, useProject, useProjects } from "@data/projects";
import { Domain, useDomains } from "@data/domains";

export type NavigationContext = {
  path: string;
  domains?: Domain[];
  domainId?: string;
  domain?: Domain;
  projectId?: string;
  project?: Project;
  projects?: Project[];
  issueKey?: string;
};

export const useNavigationContext = (): NavigationContext => {
  const { pathname: path } = useLocation();
  const { projectId, domainId: domainIdParam, issueKey } = useParams();
  const { data: project } = useProject(projectId);

  const domainId = domainIdParam ?? project?.domainId;

  const { data: domains } = useDomains();
  const domain = domains?.find((domain) => domain.id === domainId);

  const { data: projects } = useProjects(domainId ?? project?.domainId);

  return {
    domainId,
    path,
    domains,
    domain,
    project,
    projectId,
    projects,
    issueKey,
  };
};
