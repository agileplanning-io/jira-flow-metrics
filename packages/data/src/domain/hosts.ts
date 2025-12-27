export type Host = {
  type: HostType;
  normalisedHost: string;
};

export type JiraHost = Host & {
  type: HostType.Jira;
};

export type LinearHost = Host & {
  type: HostType.Linear;
};

export const normaliseHost = (host: string): Host => {
  const normalisedHost = new URL(host).host;

  return {
    type: getHostType(normalisedHost),
    normalisedHost,
  };
};

export const isJiraHost = (host: Host): host is JiraHost =>
  host.type === HostType.Jira;

export const isLinearHost = (host: Host): host is LinearHost =>
  host.type === HostType.Linear;

export enum HostType {
  Jira = "jira",
  Linear = "linear",
}

const getHostType = (normalisedHost: string) =>
  normalisedHost === "api.linear.app" ? HostType.Linear : HostType.Jira;
