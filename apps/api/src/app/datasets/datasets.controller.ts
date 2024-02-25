import { DatasetsRepository } from "@entities/datasets";
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
import { SyncUseCase } from "@usecases/datasets/sync/sync-use-case";

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

class UpdateDatasetBody {
  @ApiProperty()
  name: string;

  @ApiProperty()
  workflow: WorkflowStageBody[];

  @ApiProperty()
  defaultCycleTimePolicy: CycleTimePolicyBody;
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
    const defaultCycleTimePolicy = request.defaultCycleTimePolicy;
    const updatedDataset = await this.datasets.updateDataset(datasetId, {
      workflow,
      defaultCycleTimePolicy,
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
    @Query(
      "labels",
      new ParseArrayPipe({ items: String, separator: ",", optional: true }),
    )
    labels?: string[],
    @Query("labelFilterType") labelFilterType?: LabelFilterType,
  ) {
    let issues = await this.issues.getIssues(datasetId);

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
