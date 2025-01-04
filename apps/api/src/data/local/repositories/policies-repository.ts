import { DataCache } from "@data/storage/storage";
import { BadRequestException, Injectable } from "@nestjs/common";
import { createId } from "../id";
import { isDeepEqual, pick } from "remeda";
import { DataError } from "node-json-db";
import { DraftPolicy, SavedPolicy } from "@agileplanning-io/flow-metrics";
import { PoliciesRepository } from "@entities/projects";

@Injectable()
export class LocalPoliciesRepository extends PoliciesRepository {
  constructor(private readonly cache: DataCache) {
    super();
  }

  async createPolicy(projectId: string, params: DraftPolicy) {
    const policies = await this.getPolicies(projectId);
    const existingPolicy = policies.find((policy) =>
      isDeepEqual(policy.policy, params.policy),
    );

    // Avoid creating duplicate policies
    if (existingPolicy) {
      return existingPolicy;
    }

    const id = createId(pick(params, ["name"]));
    const policy = { id, ...params };
    await this.cache.push(policyPath(projectId, id), policy);

    return policy;
  }

  async updatePolicy(projectId: string, policyId: string, policy: SavedPolicy) {
    if (policy.id !== policyId) {
      throw new BadRequestException(
        `policy.id (${policy.id}) does not match param (${policyId})`,
      );
    }
    await this.cache.push(policyPath(projectId, policyId), policy);
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
      throw e;
    }
  }

  async setDefaultPolicy(projectId: string, policyId: string): Promise<void> {
    const policies = await this.getPolicies(projectId);
    const updatedPolicies = policies.map((policy) => ({
      ...policy,
      isDefault: policy.id === policyId,
    }));
    const updatedEntries = updatedPolicies.map((policy) => [policy.id, policy]);

    await this.cache.push(
      policiesPath(projectId),
      Object.fromEntries(updatedEntries),
    );
  }

  async deletePolicy(projectId: string, policyId: string): Promise<void> {
    await this.cache.delete(policyPath(projectId, policyId));
    await this.cache.save();
  }
}

const policiesPath = (projectId: string) => `/projects/${projectId}/policies`;
const policyPath = (projectId: string, policyId: string) =>
  `/projects/${projectId}/policies/${policyId}`;
