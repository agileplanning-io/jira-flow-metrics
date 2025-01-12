import { AgileClient, Version3Client } from "jira.js";
import { Domain, DomainsRepository } from "@entities/domains";
import { Logger } from "@nestjs/common";
import { Request } from "express";

const logger = new Logger("jira-client");

export type JiraClientFactoryParams = Pick<Domain, "host" | "email" | "token">;

export const jiraClientFactory = async (
  request: Request,
  domains: DomainsRepository,
) => {
  const domainId = request.params.domainId as string;
  const domain = await domains.getDomain(domainId);

  logger.log(`Creating Jira client for host ${domain.host}`);

  return new Version3Client({
    host: `https://${domain.host}`,
    authentication: {
      basic: {
        email: domain.email,
        apiToken: domain.token,
      },
    },
    newErrorHandling: true,
  });
};

export const createJiraClient = (domain: Domain): Version3Client => {
  logger.log(`Creating Jira client for host ${domain.host}`);
  return new Version3Client(buildConfig(domain));
};

export const createAgileClient = (domain: Domain) => {
  logger.log(`Creating Agile client for host ${domain.host}`);
  return new AgileClient(buildConfig(domain));
};

const buildConfig = (domain: Domain) => ({
  host: `https://${domain.host}`,
  authentication: {
    basic: {
      email: domain.email,
      apiToken: domain.token,
    },
  },
  newErrorHandling: true,
});
