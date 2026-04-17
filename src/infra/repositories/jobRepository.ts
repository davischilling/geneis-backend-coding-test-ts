import type { IRepository } from "../../domain/contracts";
import { ISumJobToJSON } from "../../domain/models/job.js";

export class InMemoryJobRepository implements IRepository<ISumJobToJSON> {
  private readonly jobs = new Map<string, ISumJobToJSON>();

  save(job: ISumJobToJSON): void {
    this.jobs.set(job.id, job);
  }

  findById(id: string): ISumJobToJSON | undefined {
    return this.jobs.get(id);
  }

  update(id: string, updates: Partial<ISumJobToJSON>): void {
    const job = this.jobs.get(id);
    if (job) {
      Object.assign(job, updates, { updatedAt: new Date() });
    }
  }
}
