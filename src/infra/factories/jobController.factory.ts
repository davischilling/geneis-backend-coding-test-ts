import { FastifyInstance } from "fastify";
import { JobController } from "../../application/controllers";
import { JobService } from "../../application/services";
import { InMemoryJobRepository } from "../repositories";

export const createJobControllerFactory = (app: FastifyInstance): JobController => {
    const jobRepository = new InMemoryJobRepository()
    const jobService = new JobService(jobRepository, app.log)
    return new JobController(jobService);
}