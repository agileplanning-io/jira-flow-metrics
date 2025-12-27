// import { Version3Client } from "jira.js";
import { Domain } from "@entities/domains";
import { Logger } from "@nestjs/common";
import {
  HttpLinearClient,
  isLinearHost,
  normaliseHost,
} from "@agileplanning-io/flow-data";
import { LinearClient } from "@linear/sdk";
import assert from "assert";

const logger = new Logger("jira-client");

export type JiraClientFactoryParams = Pick<Domain, "host" | "email" | "token">;

export const createLinearClient = async (
  domain: Pick<Domain, "host" | "email" | "token">,
): Promise<HttpLinearClient> => {
  logger.log(`Creating Linear client for host ${domain.host}`);

  // const { Version3Client } = await import("jira.js");

  // const v3Client = new Version3Client({
  //   host: `https://${domain.host}`,
  //   authentication: {
  //     basic: {
  //       email: domain.email,
  //       apiToken: domain.token,
  //     },
  //   },
  // });

  const linearClient = new LinearClient({ apiKey: domain.token });

  const host = normaliseHost(domain.host);

  assert(isLinearHost(host));

  return new HttpLinearClient(host, linearClient);
};
