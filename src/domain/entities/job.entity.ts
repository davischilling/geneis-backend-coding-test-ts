import { CreateSumJobDTO, ISumJob, ISumJobToJSON, JobStatus } from "../models";
import { AbstractEntity } from "./entity";

export class JobEntity extends AbstractEntity<ISumJobToJSON> implements ISumJob {
  #status: JobStatus
  #input: {
    num1: number;
    num2: number;
  }
  #result?: {
    sum: number;
  }
  #error?: string

  constructor(data: CreateSumJobDTO) {
    super({
      id: data.id,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
    this.#status = data.status ?? "pending"
    this.#input = data.input
    this.#result = data.result
    this.#error = data.error
  }

  start(): void {
    this.#status = "processing";
    this.updateEntity();
  }

  complete(): void {
    this.#status = "completed";
    this.#result = { sum: this.#input.num1 + this.#input.num2 };
    this.updateEntity();
  }

  fail(error: string): void {
    this.#status = "failed";
    this.#error = error;
    this.updateEntity();
  }

  toJSON() {
    return {
      id: this.id,
      status: this.#status,
      input: this.#input,
      result: this.#result,
      error: this.#error,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
