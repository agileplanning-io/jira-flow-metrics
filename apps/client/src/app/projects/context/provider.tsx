import { useNavigationContext } from "../../navigation/context";
import { ProjectContext, ProjectContextType } from "./context";
import { useIssues } from "@data/issues";
import { useSearchParams } from "react-router-dom";
import { CycleTimePolicy } from "@agileplanning-io/flow-metrics";
import { equals, flatten } from "rambda";
import { SearchParamsBuilder } from "@lib/search-params-builder";
import { useEffect, useRef } from "react";
import { parseCycleTimePolicy, toParams } from "./params";

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { project } = useNavigationContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const cycleTimePolicy = project
    ? parseCycleTimePolicy(searchParams, project, setSearchParams)
    : undefined;

  const { data: issues } = useIssues(project?.id, cycleTimePolicy);

  const setCycleTimePolicy = (newCycleTimePolicy: CycleTimePolicy) => {
    const changed = !equals(newCycleTimePolicy, cycleTimePolicy);
    if (changed) {
      setSearchParams((prev) => toParams(prev, newCycleTimePolicy), {
        replace: true,
      });
    }
  };

  const initialized = useRef(false);

  useEffect(() => {
    if (!project || initialized.current) {
      return;
    }

    const defaultBuilder = new SearchParamsBuilder(searchParams);
    if (!searchParams.get("epicPolicyType")) {
      defaultBuilder.set("epicPolicyType", "status");
    }
    if (!searchParams.get("policyStoryStatuses")) {
      const statuses: string[] = flatten(
        project?.workflowScheme.stories.stages
          .filter((stage) => stage.selectByDefault)
          .map((stage) => stage.statuses.map((status) => status.name)) ??
          undefined,
      );
      defaultBuilder.setAll("policyStoryStatuses", statuses);
    }
    if (!searchParams.get("policyEpicStatuses")) {
      const statuses: string[] = flatten(
        project?.workflowScheme.epics.stages
          .filter((stage) => stage.selectByDefault)
          .map((stage) => stage.statuses.map((status) => status.name)) ??
          undefined,
      );
      defaultBuilder.setAll("policyEpicStatuses", statuses);
    }
    const defaultSearchParams = defaultBuilder.getParams();
    setSearchParams(defaultSearchParams);
    initialized.current = true;
  }, [initialized, project, cycleTimePolicy, searchParams, setSearchParams]);

  const value: ProjectContextType = {
    project,
    issues,
    cycleTimePolicy,
    setCycleTimePolicy,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};
