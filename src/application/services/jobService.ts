import { FastifyBaseLogger } from "fastify";
import { IRepository } from "../../domain/contracts";
import { JobEntity } from "../../domain/entities";
import { ISumJobToJSON } from "../../domain/models";
import { IJobUsecase } from "../../domain/usecases";
import { delay } from "../utils/delay.js";

export class JobService implements IJobUsecase {
  constructor(
    private readonly repository: IRepository<ISumJobToJSON>,
    private readonly logger: FastifyBaseLogger
  ) {}

  createJob(num1: number, num2: number): ISumJobToJSON {
    const job = new JobEntity({ input: { num1, num2 } });

    this.repository.save(job.toJSON());
    this.logger.info({ jobId: job.id }, "job created");

    this.processJobAsync(job).catch(() => {});

    return job.toJSON();
  }

  findJob(jobId: string): ISumJobToJSON | undefined {
    return this.repository.findById(jobId);
  }

  private async processJobAsync(job: JobEntity): Promise<void> {
    job.start();
    this.repository.update(job.id, job.toJSON());
    this.logger.info({ jobId: job.id }, "job started");

    try {
      await delay(5000);

      job.complete();
      const snapshot = job.toJSON();
      this.repository.update(job.id, snapshot);
      this.logger.info({ jobId: job.id, sum: snapshot.result?.sum }, "job completed");
    } catch (err) {
      const error = err instanceof Error ? err.message : "Processing failed";
      job.fail(error);
      this.repository.update(job.id, job.toJSON());
      this.logger.error({ jobId: job.id, error }, "job failed");
    }
  }
}
