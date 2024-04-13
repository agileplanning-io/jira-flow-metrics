import { Injectable } from "@nestjs/common";
import {
  CreateProjectParams,
  Project,
  ProjectsRepository,
} from "@entities/projects";
import { DataError } from "node-json-db";
import { DataCache } from "@data/storage/storage";
import { createId } from "@data/local/id";
import { pick } from "remeda";

@Injectable()
export class LocalProjectsRepository extends ProjectsRepository {
  constructor(private readonly cache: DataCache) {
    super();
  }

  async getProjects(domainId: string): Promise<Project[]> {
    try {
      const projects = await this.cache.getObject<Record<string, Project>>(
        projectsPath(),
      );
      return Object.values(projects).filter(
        (project) => project.domainId === domainId,
      );
    } catch (e) {
      if (e instanceof DataError) {
        return [];
      }
      return e;
    }
  }

  async getProject(projectId: string): Promise<Project> {
    return this.cache.getObject<Project>(projectPath(projectId));
  }

  async addProject(params: CreateProjectParams): Promise<Project> {
    const id = createId(pick(params, ["domainId", "name", "jql"]));
    const project = { ...params, id };
    await this.cache.push(projectPath(id), project);
    return project;
  }

  async updateProject(
    projectId: string,
    params: Partial<CreateProjectParams>,
  ): Promise<Project> {
    const project = await this.getProject(projectId);
    Object.assign(project, params);
    await this.cache.push(projectPath(projectId), project);
    return project;
  }

  removeProject(projectId: string): Promise<void> {
    return this.cache.delete(projectPath(projectId));
  }

  async removeProjects(domainId: string): Promise<void> {
    const projects = await this.getProjects(domainId);
    for (const project of projects) {
      await this.removeProject(project.id);
    }
  }
}

const projectsPath = (): string => `/projects`;

const projectPath = (projectId: string): string => `/projects/${projectId}`;
