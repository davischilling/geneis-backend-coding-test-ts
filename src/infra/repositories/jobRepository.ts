import type { IRepository } from "../../domain/contracts";
import { ISumJobToJSON } from "../../domain/models/job.model.js";

export class InMemoryJobRepository implements IRepository<ISumJobToJSON> {
  private readonly jobs = new Map<string, ISumJobToJSON>();

  save(job: ISumJobToJSON): void {
    this.jobs.set(job.id, job);
  }

  findById(id: string): ISumJobToJSON | undefined {
    return this.jobs.get(id);
  }

  update(id: string, data: ISumJobToJSON): void {
    if (this.jobs.has(id)) {
      this.jobs.set(id, data);
    }
  }
}
