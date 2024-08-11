import { ProjectsRepository } from "@entities/projects";
import { IssuesRepository } from "@entities/issues";
import {
  CycleTimePolicy,
  cycleTimePolicySchema,
  filterSchema,
  getFlowMetrics,
  workflowStageSchema,
} from "@agileplanning-io/flow-metrics";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UsePipes,
} from "@nestjs/common";
import { SyncUseCase } from "@usecases/projects/sync/sync-use-case";
import { ZodValidationPipe } from "@lib/pipes/zod-pipe";
import { ParsedQuery } from "@lib/decorators/parsed-query";
import { z } from "zod";

// class WorkflowStageBody {
//   @ApiProperty()
//   name: string;

//   @ApiProperty()
//   selectByDefault: boolean;

//   @ApiProperty()
//   statuses: string[];
// }

// class StoryCycleTimePolicyBody {
//   @ApiProperty()
//   includeWaitTime: boolean;

//   @ApiProperty()
//   statuses: string[];
// }

// class LabelsFilterPolicyBody {
//   @ApiProperty()
//   values: string[];

//   @ApiProperty()
//   type: FilterType;
// }

// class EpicCycleTimePolicyBody {
//   labels: LabelsFilterPolicyBody;
//   includeWaitTime: boolean;
// }

// class CycleTimePolicyBody {
//   @ApiProperty()
//   stories: StoryCycleTimePolicyBody;

//   @ApiProperty()
//   epics: EpicCycleTimePolicyBody;
// }

// class UpdateProjectBody {
//   @ApiProperty()
//   name: string;

//   @ApiProperty()
//   storyWorkflowStages: WorkflowStageBody[];

//   @ApiProperty()
//   epicWorkflowStages: WorkflowStageBody[];

//   @ApiProperty()
//   defaultCycleTimePolicy: CycleTimePolicyBody;

//   @ApiProperty()
//   defaultCompletedFilter: IssueFilter;
// }

const workflowStageRequestSchema = workflowStageSchema.extend({
  statuses: z.array(z.string()),
});

const updateProjectBodyResponseSchema = z.object({
  name: z.string(),
  storyWorkflowStages: z.array(workflowStageRequestSchema),
  epicWorkflowStages: z.array(workflowStageRequestSchema),
  defaultCycleTimePolicy: cycleTimePolicySchema,
  defaultCompletedFilter: filterSchema,
});

type UpdateProjectBodyResponse = z.infer<
  typeof updateProjectBodyResponseSchema
>;

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

  @UsePipes(new ZodValidationPipe(updateProjectBodyResponseSchema))
  @Put(":projectId")
  async updateProject(
    @Param("projectId") projectId: string,
    @Body() request: UpdateProjectBodyResponse,
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

    // const defaultCycleTimePolicy: CycleTimePolicy = {
    //   stories: {
    //     type: "status",
    //     ...request.defaultCycleTimePolicy.stories,
    //   },
    //   epics: {
    //     type: "computed",
    //     ...request.defaultCycleTimePolicy.epics,
    //   },
    // };

    const defaultCompletedFilter =
      request.defaultCompletedFilter ?? project.defaultCompletedFilter;

    const defaultCycleTimePolicy =
      request.defaultCycleTimePolicy ?? project.defaultCycleTimePolicy;

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
      defaultCompletedFilter,
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
    @ParsedQuery("policy", new ZodValidationPipe(cycleTimePolicySchema))
    policy: CycleTimePolicy,
  ) {
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
