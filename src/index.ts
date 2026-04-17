import Fastify, { FastifyError, FastifyInstance } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { createJobRoutes } from "./main/routes/jobRoutes.js";

const createApp = (): FastifyInstance => {
  const app = Fastify({ logger: true });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(createJobRoutes(app));

  app.get("/health", async () => ({ status: "ok" }));

  app.setErrorHandler((error: FastifyError, _request, reply) => {
    app.log.error(error);
    if (error.validation) {
      return reply.status(400).send({ message: "Validation error" });
    }
    return reply.status(error.statusCode ?? 500).send({
      message: error.message ?? "Internal server error",
    });
  });

  return app;
};

const app = createApp();

const start = async () => {
  try {
    await app.listen({ port: 3000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
