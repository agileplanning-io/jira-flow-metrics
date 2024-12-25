import { DataCache } from "@data/storage/storage";
import { DraftPolicy, SavedPolicy } from "@entities/saved-policies";
import { Injectable } from "@nestjs/common";
import { createId } from "../id";
import { pick } from "remeda";
import { DataError } from "node-json-db";

@Injectable()
export class PoliciesRepository {
  constructor(private readonly cache: DataCache) {}

  async createPolicy(projectId: string, params: DraftPolicy) {
    const id = createId(pick(params, ["name"]));
    const policy = { id, ...params };
    await this.cache.push(policyPath(projectId, id), policy);

    return policy;
  }

  async updatePolicy(projectId: string, policy: SavedPolicy) {
    await this.cache.push(policyPath(projectId, policy.id), policy);
  }

  async getPolicies(projectId: string) {
    try {
      const policies = await this.cache.getObject<Record<string, SavedPolicy>>(
        policiesPath(projectId),
      );
      return Object.values(policies);
    } catch (e) {
      if (e instanceof DataError) {
        return [];
      }
      return e;
    }
  }
}

const policiesPath = (projectId: string) => `/projects/${projectId}/policies`;
const policyPath = (projectId: string, policyId: string) =>
  `/projects/${projectId}/policies/${policyId}`;
