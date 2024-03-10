import { Module } from "@nestjs/common";
import { ProjectsController } from "./projects.controller";
import { SyncUseCase } from "@usecases/projects/sync/sync-use-case";
@Module({
  providers: [SyncUseCase],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
