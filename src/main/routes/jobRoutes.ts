import { FastifyInstance } from "fastify";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { createJobControllerFactory } from "../../infra/factories";
import { JOB_VALIDATIONS } from "../schemas";

export const createJobRoutes = (app: FastifyInstance): FastifyPluginAsyncZod => {
  const { CREATE, CHECK_STATUS, GET_RESULT } = JOB_VALIDATIONS;
  const jobController = createJobControllerFactory(app);
  return async function jobRoutes(app) {
    app.post(
      "/add-numbers",
      CREATE,
      async (request, reply) => {
        const { num1, num2 } = request.body;
        await jobController.createJob(num1, num2, reply);
      }
    );

    app.get(
      "/check-numbers-state/:jobId",
      CHECK_STATUS,
      async (request, reply) => {
        const { jobId } = request.params;
        await jobController.checkJobStatus(jobId, reply);
      }
    );

    app.get(
      "/get-numbers-sum-by-job-id/:jobId",
      GET_RESULT,
      async (request, reply) => {
        const { jobId } = request.params;
        await jobController.getJobResult(jobId, reply);
      }
    );
  };
};
