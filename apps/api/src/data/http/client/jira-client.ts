import { Version3Client } from "jira.js";
import { Domain } from "@entities/domains";
import { Logger } from "@nestjs/common";
import { HttpJiraClient } from "@agileplanning-io/flow-data";

const logger = new Logger("jira-client");

export type JiraClientFactoryParams = Pick<Domain, "host" | "email" | "token">;

export const createJiraClient = (
  domain: Pick<Domain, "host" | "email" | "token">,
): HttpJiraClient => {
  logger.log(`Creating Jira client for host ${domain.host}`);

  const v3Client = new Version3Client({
    host: `https://${domain.host}`,
    authentication: {
      basic: {
        email: domain.email,
        apiToken: domain.token,
      },
    },
    newErrorHandling: true,
  });

  return new HttpJiraClient(v3Client);
};
