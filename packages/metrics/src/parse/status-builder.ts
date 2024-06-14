import { Status, StatusCategory, TransitionStatus } from "../issues";

export class StatusBuilder {
  private readonly map: Record<string, TransitionStatus> = {
    created: {
      name: "Created",
      category: StatusCategory.ToDo,
    },
  };

  constructor(jiraStatuses: Status[]) {
    for (const jiraStatus of jiraStatuses) {
      this.map[jiraStatus.jiraId] = {
        name: titleize(jiraStatus.name),
        category: jiraStatus.category,
      };
    }
  }

  getStatus(jiraId: string, name: string): TransitionStatus {
    const status = this.map[jiraId];
    if (status) {
      return status;
    }

    // Status has been deleted in Jira but still exists in the transition history. Try to infer
    // what it might be.

    const canonicalName = titleize(name);

    const foundStatus = Object.values(this.map).find(
      (status) => status.name === canonicalName,
    );

    if (foundStatus) {
      return foundStatus;
    }

    // TODO: consider a StatusCategory type of unknown here
    return {
      name: canonicalName,
      category: StatusCategory.InProgress,
    };
  }

  getStatuses(): TransitionStatus[] {
    return Object.values(this.map);
  }
}

const titleize = (text: string): string => {
  return text.toLowerCase().replace(/(?:^|\s|-)\S/g, (x) => x.toUpperCase());
};
