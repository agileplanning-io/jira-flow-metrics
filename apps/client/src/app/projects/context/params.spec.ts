import { FilterType, StatusCategory } from "@agileplanning-io/flow-metrics";
import { parseCycleTimePolicy, toParams } from "./params";
import { describe, expect, it, vitest } from "vitest";
import { groupBy } from "rambda";
import { Project } from "@data/projects";

describe("toParams", () => {
  it("converts computed epic cycle time policies to search params", () => {
    const params = toParams(new URLSearchParams(), {
      stories: {
        type: "status",
        includeWaitTime: true,
        statuses: ["In Progress", "In Test"],
      },
      epics: {
        type: "computed",
        labelsFilter: {
          labelFilterType: FilterType.Exclude,
          labels: ["tech-debt", "discovery"],
        },
      },
    });

    const result = toObject(params);

    expect(result).toEqual({
      storyPolicyStatuses: ["In Progress", "In Test"],
      storyPolicyIncludeWaitTime: "true",
      epicPolicyType: "computed",
      epicPolicyLabelFilterType: "exclude",
      epicPolicyLabels: ["tech-debt", "discovery"],
    });
  });

  it("converts status epic cycle time policies to search params", () => {
    const params = toParams(new URLSearchParams(), {
      stories: {
        type: "status",
        includeWaitTime: true,
        statuses: ["In Progress", "In Test"],
      },
      epics: {
        type: "status",
        includeWaitTime: false,
        statuses: ["In Progress", "Pending Release"],
      },
    });

    const result = toObject(params);

    expect(result).toEqual({
      storyPolicyStatuses: ["In Progress", "In Test"],
      storyPolicyIncludeWaitTime: "true",
      epicPolicyType: "status",
      epicPolicyStatuses: ["In Progress", "Pending Release"],
      epicPolicyIncludeWaitTime: "false",
    });
  });
});

describe("parseCycleTimePolicy", () => {
  it("parses computed epic cycle time params", () => {
    const params = new URLSearchParams({
      storyPolicyIncludeWaitTime: "true",
      storyPolicyStatuses: "In Test",
      epicPolicyType: "computed",
      epicPolicyLabels: "discovery",
      epicPolicyLabelFilterType: "include",
    });

    const project = buildProject();

    const setSearchParams = vitest.fn();

    const policy = parseCycleTimePolicy(params, project, setSearchParams);

    expect(policy).toEqual({
      epics: {
        type: "computed",
        labelsFilter: {
          labelFilterType: "include",
          labels: ["discovery"],
        },
      },
      stories: {
        type: "status",
        includeWaitTime: true,
        statuses: ["In Test"],
      },
    });
    expect(setSearchParams).not.toHaveBeenCalled();
  });

  it("parses status epic cycle time params", () => {
    const params = new URLSearchParams({
      storyPolicyIncludeWaitTime: "true",
      storyPolicyStatuses: "In Test",
      epicPolicyType: "status",
      epicPolicyStatuses: "In Progress",
      epicPolicyIncludeWaitTime: "false",
    });

    const project = buildProject();

    const setSearchParams = vitest.fn();

    const policy = parseCycleTimePolicy(params, project, setSearchParams);

    expect(policy).toEqual({
      epics: {
        type: "status",
        includeWaitTime: false,
        statuses: ["In Progress"],
      },
      stories: {
        type: "status",
        includeWaitTime: true,
        statuses: ["In Test"],
      },
    });
    expect(setSearchParams).not.toHaveBeenCalled();
  });

  it("applies computed default project cycle time policies", () => {
    const params = new URLSearchParams();

    const setSearchParams = vitest.fn();

    const project = buildProject();

    const policy = parseCycleTimePolicy(params, project, setSearchParams);

    expect(policy).toEqual(project.defaultCycleTimePolicy);

    expect(setSearchParams).toHaveBeenCalledOnce();
    expect(toObject(setSearchParams.mock.lastCall[0])).toEqual({
      epicPolicyType: "computed",
      epicPolicyLabelFilterType: "exclude",
      epicPolicyLabels: "tech-debt",
      storyPolicyStatuses: "In Progress",
      storyPolicyIncludeWaitTime: "false",
    });
  });

  it("applies status default project cycle time policies", () => {
    const params = new URLSearchParams();
    const project = buildProject({
      defaultCycleTimePolicy: {
        stories: {
          type: "status",
          statuses: ["In Progress"],
          includeWaitTime: false,
        },
        epics: {
          type: "status",
          statuses: ["In Progress"],
          includeWaitTime: false,
        },
      },
    });

    const setSearchParams = vitest.fn();

    const policy = parseCycleTimePolicy(params, project, setSearchParams);

    expect(policy).toEqual(project.defaultCycleTimePolicy);

    expect(setSearchParams).toHaveBeenCalledOnce();
    expect(toObject(setSearchParams.mock.lastCall[0])).toEqual({
      epicPolicyType: "status",
      epicPolicyStatuses: "In Progress",
      epicPolicyIncludeWaitTime: "false",
      storyPolicyStatuses: "In Progress",
      storyPolicyIncludeWaitTime: "false",
    });
  });
});

const toObject = (params: URLSearchParams) => {
  const grouped = groupBy((entry) => entry[0], Array.from(params.entries()));
  const entries = Object.entries(grouped).map(([key, entries]) => {
    return entries.length === 1
      ? [key, entries[0][1]]
      : [key, entries.map((entry) => entry[1])];
  });
  return Object.fromEntries(entries);
};

const buildProject = (params: Partial<Project> = {}): Project => {
  const defaults: Project = {
    id: "project-id",
    name: "My Project",
    jql: "project = MYPROJ",
    domainId: "domain-id",
    workflowScheme: {
      stories: {
        stages: [],
        statuses: [
          { name: "To Do", category: StatusCategory.ToDo },
          { name: "In Progress", category: StatusCategory.InProgress },
          { name: "In Test", category: StatusCategory.InProgress },
          { name: "Done", category: StatusCategory.Done },
        ],
      },
      epics: {
        stages: [],
        statuses: [
          { name: "To Do", category: StatusCategory.ToDo },
          { name: "In Progress", category: StatusCategory.InProgress },
          { name: "Done", category: StatusCategory.Done },
        ],
      },
    },
    defaultCycleTimePolicy: {
      stories: {
        type: "status",
        includeWaitTime: false,
        statuses: ["In Progress"],
      },
      epics: {
        type: "computed",
        labelsFilter: {
          labelFilterType: FilterType.Exclude,
          labels: ["tech-debt"],
        },
      },
    },
    labels: [],
    components: [],
  };
  return {
    ...defaults,
    ...params,
  };
};
