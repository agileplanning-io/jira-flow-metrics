import { ProjectsRepository } from "@entities/projects";
import { IssuesRepository } from "@entities/issues";
import {
  CycleTimePolicy,
  LabelFilterType,
  getFlowMetrics,
} from "@agileplanning-io/flow-metrics";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Put,
  Query,
} from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { SyncUseCase } from "@usecases/projects/sync/sync-use-case";

class WorkflowStageBody {
  @ApiProperty()
  name: string;

  @ApiProperty()
  selectByDefault: boolean;

  @ApiProperty()
  statuses: string[];
}

class CycleTimePolicyBody {
  @ApiProperty()
  includeWaitTime: boolean;

  @ApiProperty()
  statuses: string[];

  @ApiProperty()
  labelFilterType: LabelFilterType;

  @ApiProperty()
  labels: string[];
}

class UpdateProjectBody {
  @ApiProperty()
  name: string;

  @ApiProperty()
  workflow: WorkflowStageBody[];

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
    const workflow = request.workflow.map((stage) => ({
      name: stage.name,
      selectByDefault: stage.selectByDefault,
      statuses: project.statuses.filter((status) =>
        stage.statuses.includes(status.name),
      ),
    }));
    const defaultCycleTimePolicy = request.defaultCycleTimePolicy;
    const updatedProject = await this.projects.updateProject(projectId, {
      workflow,
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
    @Query("includeWaitTime") includeWaitTime: string,
    @Query(
      "statuses",
      new ParseArrayPipe({ items: String, separator: ",", optional: true }),
    )
    statuses?: string[],
    @Query(
      "labels",
      new ParseArrayPipe({ items: String, separator: ",", optional: true }),
    )
    labels?: string[],
    @Query("labelFilterType") labelFilterType?: LabelFilterType,
  ) {
    let issues = await this.issues.getIssues(projectId);

    const policy: CycleTimePolicy = {
      includeWaitTime: ["true", "1"].includes(includeWaitTime),
      statuses,
      labels,
      labelFilterType,
    };

    issues = getFlowMetrics(issues, policy);

    return issues.map((issue) => {
      const parent = issue.parentKey
        ? issues.find((parent) => parent.key === issue.parentKey)
        : undefined;
      return { ...issue, parent };
    });
  }
}
