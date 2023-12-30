import { DatasetsRepository } from "@entities/datasets";
import { IssuesRepository } from "@entities/issues";
import { getFlowMetrics } from "@jbrunton/flow-metrics";
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
import { SyncUseCase } from "@usecases/datasets/sync/sync-use-case";

class WorkflowStageBody {
  @ApiProperty()
  name: string;

  @ApiProperty()
  selectByDefault: boolean;

  @ApiProperty()
  statuses: string[];
}

class UpdateDatasetBody {
  @ApiProperty()
  name: string;

  @ApiProperty()
  workflow: WorkflowStageBody[];
}

@Controller("datasets")
export class DatasetsController {
  constructor(
    private readonly datasets: DatasetsRepository,
    private readonly issues: IssuesRepository,
    private readonly sync: SyncUseCase,
  ) {}

  @Get(":datasetId")
  async getDataset(@Param("datasetId") datasetId: string) {
    return this.datasets.getDataset(datasetId);
  }

  @Put(":datasetId")
  async updateDataset(
    @Param("datasetId") datasetId: string,
    @Body() request: UpdateDatasetBody,
  ) {
    const dataset = await this.datasets.getDataset(datasetId);
    const workflow = request.workflow.map((stage) => ({
      name: stage.name,
      selectByDefault: stage.selectByDefault,
      statuses: dataset.statuses.filter((status) =>
        stage.statuses.includes(status.name),
      ),
    }));
    const updatedDataset = await this.datasets.updateDataset(datasetId, {
      workflow,
    });
    return updatedDataset;
  }

  @Delete(":datasetId")
  async removeDataset(@Param("datasetId") datasetId: string) {
    return this.datasets.removeDataset(datasetId);
  }

  @Put(":datasetId/sync")
  async syncDataset(@Param("datasetId") datasetId: string) {
    return this.sync.exec(datasetId);
  }

  @Get(":datasetId/issues")
  async getIssues(
    @Param("datasetId") datasetId: string,
    @Query("includeWaitTime") includeWaitTime: string,
    @Query(
      "statuses",
      new ParseArrayPipe({ items: String, separator: ",", optional: true }),
    )
    statuses?: string[],
  ) {
    let issues = await this.issues.getIssues(datasetId);

    issues = getFlowMetrics(
      issues,
      ["true", "1"].includes(includeWaitTime),
      statuses,
    );

    return issues.map((issue) => {
      const parent = issue.parentKey
        ? issues.find((parent) => parent.key === issue.parentKey)
        : undefined;
      return { ...issue, parent };
    });
  }

  @Get(":datasetId/workflows")
  async getWorkflows(@Param("datasetId") datasetId: string) {
    const dataset = await this.datasets.getDataset(datasetId);
    // TODO: epic cycle time policies
    return {
      Story: dataset.workflow,
      Epic: [],
    };
  }
}
