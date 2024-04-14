import { ProjectsRepository } from "@entities/projects";
import { IssuesRepository } from "@entities/issues";
import {
  CycleTimePolicy,
  FilterType,
  getFlowMetrics,
} from "@agileplanning-io/flow-metrics";
import { qsParse } from "@agileplanning-io/flow-lib";
import { Body, Controller, Delete, Get, Param, Put, Req } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { SyncUseCase } from "@usecases/projects/sync/sync-use-case";
import { URL } from "url";

class WorkflowStageBody {
  @ApiProperty()
  name: string;

  @ApiProperty()
  selectByDefault: boolean;

  @ApiProperty()
  statuses: string[];
}

class StoryCycleTimePolicyBody {
  @ApiProperty()
  includeWaitTime: boolean;

  @ApiProperty()
  statuses: string[];
}

class LabelsFilterPolicyBody {
  @ApiProperty()
  values: string[];

  @ApiProperty()
  type: FilterType;
}

class EpicCycleTimePolicyBody {
  labels: LabelsFilterPolicyBody;
}

class CycleTimePolicyBody {
  @ApiProperty()
  stories: StoryCycleTimePolicyBody;

  @ApiProperty()
  epics: EpicCycleTimePolicyBody;
}

class UpdateProjectBody {
  @ApiProperty()
  name: string;

  @ApiProperty()
  storyWorkflowStages: WorkflowStageBody[];

  @ApiProperty()
  epicWorkflowStages: WorkflowStageBody[];

  @ApiProperty()
  defaultCycleTimePolicy: CycleTimePolicyBody;
}

@Controller("projects")
export class ProjectsController {
  constructor(
    private readonly projects: ProjectsRepository,
    private readonly issues: IssuesRepository,
    private readonly sync: SyncUseCase,
  ) {}

  @Get(":projectId")
  async getProject(@Param("projectId") projectId: string) {
    return this.projects.getProject(projectId);
  }

  @Put(":projectId")
  async updateProject(
    @Param("projectId") projectId: string,
    @Body() request: UpdateProjectBody,
  ) {
    const project = await this.projects.getProject(projectId);
    const scheme = project.workflowScheme;

    if (!scheme) {
      // the project hasn't been synced yet so nothing else to do
      return;
    }

    const storyStages = request.storyWorkflowStages.map((stage) => ({
      name: stage.name,
      selectByDefault: stage.selectByDefault,
      statuses: scheme.stories.statuses.filter((status) =>
        stage.statuses.includes(status.name),
      ),
    }));

    const epicStages = request.epicWorkflowStages.map((stage) => ({
      name: stage.name,
      selectByDefault: stage.selectByDefault,
      statuses: scheme.epics.statuses.filter((status) =>
        stage.statuses.includes(status.name),
      ),
    }));

    const defaultCycleTimePolicy: CycleTimePolicy = {
      stories: {
        type: "status",
        ...request.defaultCycleTimePolicy.stories,
      },
      epics: {
        type: "computed",
        ...request.defaultCycleTimePolicy.epics,
      },
    };

    const updatedProject = await this.projects.updateProject(projectId, {
      workflowScheme: {
        stories: {
          stages: storyStages,
          statuses: scheme.stories.statuses,
        },
        epics: {
          stages: epicStages,
          statuses: scheme.epics.statuses,
        },
      },
      defaultCycleTimePolicy,
    });

    return updatedProject;
  }

  @Delete(":projectId")
  async removeProject(@Param("projectId") projectId: string) {
    return this.projects.removeProject(projectId);
  }

  @Put(":projectId/sync")
  async syncProject(@Param("projectId") projectId: string) {
    return this.sync.exec(projectId);
  }

  @Get(":projectId/issues")
  async getIssues(
    @Param("projectId") projectId: string,
    @Req() request: Request,
  ) {
    const url = new URL(request.url, "http://localhost");
    const queryObject = qsParse(url.search);
    const policy = queryObject["policy"] as CycleTimePolicy;
    let issues = await this.issues.getIssues(projectId);

    issues = getFlowMetrics(issues, policy);

    return issues.map((issue) => {
      const parent = issue.parentKey
        ? issues.find((parent) => parent.key === issue.parentKey)
        : undefined;
      return { ...issue, parent };
    });
  }
}
