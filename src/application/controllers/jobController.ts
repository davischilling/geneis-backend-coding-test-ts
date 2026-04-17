import { FastifyReply } from "fastify";
import { IJobUsecase } from "../../domain/usecases/index.js";

export class JobController {
  constructor(private readonly service: IJobUsecase) {}

  async createJob(num1: number, num2: number, reply: FastifyReply): Promise<void> {
    const job = this.service.createJob(num1, num2);
    reply.status(201).send({ jobId: job.id, status: job.status });
  }

  async checkJobStatus(jobId: string, reply: FastifyReply): Promise<void> {
    const job = this.service.findJob(jobId);

    if (!job) {
      reply.status(404).send({ message: "Job not found" });
      return;
    }

    reply.status(200).send({ jobId: job.id, status: job.status });
  }

  async getJobResult(jobId: string, reply: FastifyReply): Promise<void> {
    const job = this.service.findJob(jobId);

    if (!job) {
      reply.status(404).send({ message: "Job not found" });
      return;
    }

    if (job.status !== "completed") {
      reply.status(202).send({ message: "Job not completed yet" });
      return;
    }

    reply.status(200).send({
      jobId: job.id,
      status: job.status,
      input: job.input,
      result: job.result,
    });
  }
}
