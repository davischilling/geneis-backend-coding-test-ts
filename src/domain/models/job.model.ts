export type JobStatus = "pending" | "processing" | "completed" | "failed";

export type CreateSumJobDTO = {
  id?: string;
  status?: JobStatus;
  input: {
    num1: number;
    num2: number;
  };
  result?: {
    sum: number;
  };
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ISumJobToJSON = {
  id: string;
  status: JobStatus;
  input: {
    num1: number;
    num2: number;
  };
  result?: {
    sum: number;
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface ISumJob {
  start(): void;
  complete(): void;
  fail(error: string): void;
  toJSON(): ISumJobToJSON;
}