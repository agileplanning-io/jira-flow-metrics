import { HostType, normaliseHost } from "./hosts";

describe("normaliseHost", () => {
  it("constructs a normalised view of the host url", () => {
    expect(normaliseHost("https://example.jira.com")).toEqual({
      normalisedHost: "example.jira.com",
      type: HostType.Jira,
    });

    expect(normaliseHost("https://api.linear.app")).toEqual({
      normalisedHost: "api.linear.app",
      type: HostType.Linear,
    });
  });
});
