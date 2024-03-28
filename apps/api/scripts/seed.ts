import { DomainsRepository } from "@entities/domains";
import { NestFactory } from "@nestjs/core";
import { MainModule } from "../src/main-module";
import { ProjectsRepository } from "@entities/projects";
import { IssuesRepository } from "@entities/issues";
import {
  HierarchyLevel,
  Issue,
  Status,
  StatusCategory,
  buildIssue,
} from "@agileplanning-io/flow-metrics";
import { flatten, times } from "rambda";
import { INestApplicationContext } from "@nestjs/common";
import { addMinutes, subHours } from "date-fns";
import { randomInt } from "crypto";
import * as weibull from "@stdlib/random-base-weibull";
import { faker } from "@faker-js/faker";

const rand = weibull.factory({ seed: 1234 });

const domainId = "EIleBQKUNZj6";

const createDomain = async (domains: DomainsRepository) => {
  try {
    return await domains.getDomain(domainId);
  } catch {
    return await domains.addDomain({
      host: "jira.example.com",
      email: "me@example.com",
      token: "my-token",
    });
  }
};

const projectId = "-xD8fzU7kki0";

const createProject = async (projects: ProjectsRepository) => {
  try {
    return await projects.getProject(projectId);
  } catch {
    return await projects.addProject({
      domainId,
      name: "My Project",
      jql: "project = MYPROJ",
      statuses: {
        stories: [backlog, inProgress, done],
        epics: [],
      },
      labels: [],
      components: [],
      defaultCycleTimePolicy: {
        stories: {
          type: "status",
          includeWaitTime: false,
          statuses: [inProgress.name, inReview.name],
        },
        epics: {
          type: "computed",
        },
      },
      workflow: {
        stories: {
          stages: [
            {
              name: backlog.name,
              statuses: [backlog],
              selectByDefault: false,
            },
            {
              name: inProgress.name,
              statuses: [inProgress, inReview],
              selectByDefault: true,
            },
            {
              name: done.name,
              statuses: [done],
              selectByDefault: false,
            },
          ],
        },
        epics: {
          stages: [],
        },
      },
    });
  }
};

const backlog: Status = {
  jiraId: "12",
  name: "Backlog",
  category: StatusCategory.ToDo,
};

const inProgress: Status = {
  jiraId: "34",
  name: "In Progress",
  category: StatusCategory.InProgress,
};

const inReview: Status = {
  jiraId: "42",
  name: "In Review",
  category: StatusCategory.InProgress,
};

const done: Status = {
  jiraId: "56",
  name: "Done",
  category: StatusCategory.Done,
};

const buildEpic = (index: number) => {
  const now = new Date();

  const epicSummary =
    faker.company.catchPhraseAdjective() +
    " " +
    faker.company.catchPhraseDescriptor() +
    " " +
    faker.hacker.noun();

  const epic = buildIssue({
    issueType: "Epic",
    summary: epicSummary,
    hierarchyLevel: HierarchyLevel.Epic,
    status: done.name,
    statusCategory: StatusCategory.Done,
  });

  const children = times(() => {
    const started = subHours(now, 12 * (index * 10 + randomInt(10)) + 12 * 6);
    const reviewDate = addMinutes(started, rand(1.2, 7 * 24 * 60));
    const completed = addMinutes(reviewDate, rand(1, 1 * 24 * 60));

    const storySummary =
      faker.commerce.productAdjective() +
      " " +
      faker.color.human() +
      " " +
      faker.hacker.noun();

    return buildIssue({
      summary: storySummary,
      parentKey: epic.key,
      status: done.name,
      statusCategory: StatusCategory.Done,
      created: subHours(started, randomInt(10) + 1),
      transitions: [
        {
          fromStatus: backlog,
          toStatus: inProgress,
          date: started,
        },
        {
          fromStatus: inProgress,
          toStatus: inReview,
          date: reviewDate,
        },
        {
          fromStatus: inReview,
          toStatus: done,
          date: completed,
        },
      ],
    });
  }, 5);

  return [epic, ...children];
};

const seedData = async (app: INestApplicationContext) => {
  const domains = await app.resolve(DomainsRepository);
  const domain = await createDomain(domains);
  console.info("Created domain", domain);

  const projects = await app.resolve(ProjectsRepository);
  const project = await createProject(projects);
  console.info("Created project", project);

  const issues: Issue[] = flatten(times((index) => buildEpic(index), 15));
  const issuesRepository = await app.resolve(IssuesRepository);
  await issuesRepository.setIssues(projectId, issues);
};

const destroyData = async (app: INestApplicationContext) => {
  const domains = await app.resolve(DomainsRepository);
  const projects = await app.resolve(ProjectsRepository);

  await domains.removeDomain(domainId);
  await projects.removeProjects(domainId);
};

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MainModule);
  await destroyData(app);
  await seedData(app);
}
bootstrap();
