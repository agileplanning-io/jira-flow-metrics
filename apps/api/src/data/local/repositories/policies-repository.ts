import { DataCache } from "@data/storage/storage";
import { Injectable } from "@nestjs/common";
import { createId } from "../id";
import { pick } from "remeda";
import { DataError } from "node-json-db";
import { DraftPolicy, SavedPolicy } from "@agileplanning-io/flow-metrics";
import { PoliciesRepository } from "@entities/projects";

@Injectable()
export class LocalPoliciesRepository extends PoliciesRepository {
  constructor(private readonly cache: DataCache) {
    super();
  }

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

  async setDefaultPolicy(projectId: string, policyId: string): Promise<void> {
    const policies = await this.getPolicies(projectId);

    await this.cache.push(
      policiesPath(projectId),
      policies.map((policy) => ({
        ...policy,
        isDefault: policy.id === policyId,
      })),
    );
  }

  async deletePolicy(projectId: string, policyId: string): Promise<void> {
    console.info("deletePolicy", projectId, policyId);
    await this.cache.delete(policyPath(projectId, policyId));
    await this.cache.save();
  }
}

const policiesPath = (projectId: string) => `/projects/${projectId}/policies`;
const policyPath = (projectId: string, policyId: string) =>
  `/projects/${projectId}/policies/${policyId}`;
