import { FastifyBaseLogger } from "fastify";
import { IRepository } from "../../domain/contracts";
import { JobEntity } from "../../domain/entities";
import { ISumJobToJSON } from "../../domain/models/job.js";
import { IJobUsecase } from "../../domain/usecases";
import { delay } from "../utils/delay.js";

export class JobService implements IJobUsecase {
  constructor(
    private readonly repository: IRepository<ISumJobToJSON>,
    private readonly logger: FastifyBaseLogger
  ) {}

  createJob(num1: number, num2: number): ISumJobToJSON {
    const job = new JobEntity({
      input: { num1, num2 },
    });

    this.repository.save(job.toJSON());
    this.logger.info({ jobId: job.id }, "job created");

    this.processJobAsync(job.id, num1, num2).catch(() => {});

    return job.toJSON();
  }

  findJob(jobId: string): ISumJobToJSON | undefined {
    return this.repository.findById(jobId);
  }

  private async processJobAsync(jobId: string, num1: number, num2: number): Promise<void> {
    this.repository.update(jobId, { status: "processing" });
    this.logger.info({ jobId }, "job started");

    try {
      await delay(5000);

      const sum = num1 + num2;
      this.repository.update(jobId, { status: "completed", result: { sum } });
      this.logger.info({ jobId, sum }, "job completed");
    } catch (err) {
      const error = err instanceof Error ? err.message : "Processing failed";
      this.repository.update(jobId, { status: "failed", error });
      this.logger.error({ jobId, error }, "job failed");
    }
  }
}
