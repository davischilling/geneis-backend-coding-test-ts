import { ISumJobToJSON } from "../models";

export interface IJobUsecase {
    createJob(num1: number, num2: number): ISumJobToJSON;
    findJob(jobId: string): ISumJobToJSON | undefined;
}