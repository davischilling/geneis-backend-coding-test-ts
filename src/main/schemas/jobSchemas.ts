import { z } from "zod";

export const createJobBodySchema = z.object({
  num1: z.number(),
  num2: z.number(),
});

export const jobIdParamsSchema = z.object({
  jobId: z.string().min(1),
});

export const JOB_VALIDATIONS = {
  CREATE: {
    schema: {
      body: createJobBodySchema,
      response: {
        201: z.object({
          jobId: z.string().min(1),
          status: z.string().min(1),
        }),
      },
    }
  },
  CHECK_STATUS: {
    schema: {
      params: jobIdParamsSchema,
      response: {
        200: z.object({
          jobId: z.string().min(1),
          status: z.string().min(1),
        }),
      },
    }
  },
  GET_RESULT: {
    schema: {
      params: jobIdParamsSchema,
      response: {
        200: z.object({
          jobId: z.string().min(1),
          status: z.string().min(1),
          input: z.object({
            num1: z.number(),
            num2: z.number(),
          }),
          result: z.object({
            sum: z.number(),
          }),
        }),
      },
    }
  },
}