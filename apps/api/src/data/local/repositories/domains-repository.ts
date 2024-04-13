import { Injectable } from "@nestjs/common";
import { DataError } from "node-json-db";
import {
  CreateDomainParams,
  Domain,
  DomainsRepository,
} from "@entities/domains";
import { DomainsCache } from "../../storage/storage";
import { omit } from "remeda";
import { createId } from "@data/local/id";

@Injectable()
export class LocalDomainsRepository extends DomainsRepository {
  constructor(private readonly cache: DomainsCache) {
    super();
  }

  async getDomains(): Promise<Domain[]> {
    try {
      const domains = await this.cache.getObject<Domain[]>("/domains");
      return Object.values(domains);
    } catch (e) {
      if (e instanceof DataError) {
        return [];
      }
      throw e;
    }
  }

  async getDomain(domainId: string): Promise<Domain> {
    const domain = await this.cache.getObject<Domain>(`/domains/${domainId}`);
    return domain;
  }

  async addDomain(params: CreateDomainParams): Promise<Domain> {
    const id = createId(omit(params, ["token"]));
    const domain = { ...params, id };
    await this.cache.push(`/domains/${id}`, domain);
    return domain;
  }

  async removeDomain(domainId: string): Promise<void> {
    await this.cache.delete(`/domains/${domainId}`);
  }
}
