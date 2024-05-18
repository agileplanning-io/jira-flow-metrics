import { DomainsRepository } from "@entities/domains";
import { NestFactory } from "@nestjs/core";
import { MainModule } from "../src/main-module";
import { ProjectsRepository } from "@entities/projects";
import { IssuesRepository } from "@entities/issues";
import {
  FilterType,
  HierarchyLevel,
  Issue,
  Status,
  StatusCategory,
  buildIssue,
} from "@agileplanning-io/flow-metrics";
import { flatten, times } from "remeda";
import { INestApplicationContext } from "@nestjs/common";
import { addMinutes, subDays, subHours } from "date-fns";
import { randomInt } from "crypto";
import * as weibull from "@stdlib/random-base-weibull";
import { base, faker } from "@faker-js/faker";

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
    await projects.removeProject(projectId);
  } catch {
    // project doesn't exist
  }

  return await projects.addProject({
    domainId,
    name: "My Project",
    jql: "project = MYPROJ",
    labels: ["wont-fix", "duplicate", "discovery"],
    components: [],
    issueTypes: [],
    resolutions: ["Done", "duplicate", "Won't Do"],
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
    defaultCompletedFilter: {
      resolutions: {
        type: FilterType.Include,
        values: ["Done"],
      },
    },
    workflowScheme: {
      stories: {
        statuses: [backlog, inProgress, inReview, pendingRelease, done],
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
            statuses: [done, pendingRelease],
            selectByDefault: false,
          },
        ],
      },
      epics: {
        stages: [],
        statuses: [],
      },
    },
  });
};

const backlog: Status = {
  jiraId: "12",
  name: "Backlog",
  category: StatusCategory.ToDo,
};

const inProgress: Status = {
  jiraId: "13",
  name: "In Progress",
  category: StatusCategory.InProgress,
};

const inReview: Status = {
  jiraId: "14",
  name: "In Review",
  category: StatusCategory.InProgress,
};

const pendingRelease: Status = {
  jiraId: "15",
  name: "Pending Release",
  category: StatusCategory.Done,
};

const done: Status = {
  jiraId: "16",
  name: "Done",
  category: StatusCategory.Done,
};

const buildEpic = (index: number) => {
  const now = new Date();

  const isInProgress = index === 0;

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

  const getStoryDates = (index: number) => {
    const baseline = subHours(now, 12 * (index * 10 + randomInt(10)) + 12 * 6);
    // create a wider distribution for the ageing wip chart
    const adjustment = isInProgress ? randomInt(7) : 0;
    const started = subDays(baseline, adjustment);
    const reviewDate = addMinutes(baseline, rand(1.2, 7 * 24 * 60));
    const completed = addMinutes(reviewDate, rand(1, 1 * 24 * 60));
    return { started, reviewDate, completed };
  };

  const children = times(5, () => {
    const { started, reviewDate, completed } = getStoryDates(index);

    const storySummary =
      faker.commerce.productAdjective() +
      " " +
      faker.color.human() +
      " " +
      faker.hacker.noun();

    const getTransitions = () => {
      const startedTransitions = [
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
      ];
      return isInProgress
        ? startedTransitions
        : [
            ...startedTransitions,
            {
              fromStatus: inReview,
              toStatus: done,
              date: completed,
            },
          ];
    };

    return buildIssue({
      summary: storySummary,
      parentKey: epic.key,
      status: isInProgress ? inProgress.name : done.name,
      statusCategory: isInProgress
        ? StatusCategory.InProgress
        : StatusCategory.Done,
      created: subHours(started, randomInt(10) + 1),
      resolution: isInProgress ? undefined : "Done",
      transitions: getTransitions(),
    });
  });

  return [epic, ...children];
};

const seedData = async (app: INestApplicationContext) => {
  const domains = await app.resolve(DomainsRepository);
  const domain = await createDomain(domains);
  console.info("Created domain", domain);

  const projects = await app.resolve(ProjectsRepository);
  const project = await createProject(projects);
  console.info("Created project", project);

  const issues: Issue[] = flatten(times(15, (index) => buildEpic(index)));
  const issuesRepository = await app.resolve(IssuesRepository);
  await issuesRepository.setIssues(projectId, issues);

  await projects.updateProject(project.id, {
    lastSync: { issueCount: issues.length, date: new Date() },
  });
};

const destroyData = async (app: INestApplicationContext) => {
  const domains = await app.resolve(DomainsRepository);
  const projects = await app.resolve(ProjectsRepository);

  await projects.removeProjects(domainId);
  await domains.removeDomain(domainId);
};

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MainModule);
  await destroyData(app);
  await seedData(app);
}
bootstrap();
