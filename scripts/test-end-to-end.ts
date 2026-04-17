const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const ADD_NUMBERS_URL = `${BASE_URL}/add-numbers`;
const STATUS_URL = (jobId: string) => `${BASE_URL}/check-numbers-state/${jobId}`;
const RESULT_URL = (jobId: string) => `${BASE_URL}/get-numbers-sum-by-job-id/${jobId}`;

const TOTAL_JOBS = Number(process.argv[2] ?? 10);
const POLL_INTERVAL_MS = 500;

type CreatedJob = {
  jobId: string;
  num1: number;
  num2: number;
  expectedSum: number;
  createdAt: number;
  completedAt?: number;
};

type StatusResponse = {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
};

type ResultResponse = {
  jobId: string;
  status: "completed";
  input: { num1: number; num2: number };
  result: { sum: number };
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createRandomPair(): { num1: number; num2: number; expectedSum: number } {
  const num1 = randomInt(1, 10000);
  const num2 = randomInt(1, 10000);
  return { num1, num2, expectedSum: num1 + num2 };
}

async function createJob(num1: number, num2: number): Promise<CreatedJob> {
  const createdAt = performance.now();

  const response = await fetch(ADD_NUMBERS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ num1, num2 }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create job: ${response.status}`);
  }

  const data = (await response.json()) as { jobId: string; status: string };

  return { jobId: data.jobId, num1, num2, expectedSum: num1 + num2, createdAt };
}

async function getStatus(jobId: string): Promise<StatusResponse> {
  const response = await fetch(STATUS_URL(jobId));

  if (!response.ok) {
    throw new Error(`Failed to fetch status for ${jobId}: ${response.status}`);
  }

  return (await response.json()) as StatusResponse;
}

async function getResult(jobId: string): Promise<ResultResponse> {
  const response = await fetch(RESULT_URL(jobId));

  if (!response.ok) {
    throw new Error(`Failed to fetch result for ${jobId}: ${response.status}`);
  }

  return (await response.json()) as ResultResponse;
}

async function waitForAllJobs(
  createdJobs: CreatedJob[]
): Promise<Map<string, "completed" | "failed">> {
  const finalStatuses = new Map<string, "completed" | "failed">();

  while (true) {
    const statuses = await Promise.all(createdJobs.map((job) => getStatus(job.jobId)));

    let pending = 0;
    let processing = 0;
    let completed = 0;
    let failed = 0;

    for (let i = 0; i < statuses.length; i++) {
      const { status, jobId } = statuses[i];
      const job = createdJobs[i];

      if (status === "pending") {
        pending += 1;
      } else if (status === "processing") {
        processing += 1;
      } else if (status === "completed") {
        completed += 1;
        if (!finalStatuses.has(jobId)) {
          finalStatuses.set(jobId, "completed");
          job.completedAt = performance.now();
        }
      } else if (status === "failed") {
        failed += 1;
        if (!finalStatuses.has(jobId)) {
          finalStatuses.set(jobId, "failed");
        }
      }
    }

    console.log(
      `  pending: ${pending}  processing: ${processing}  completed: ${completed}  failed: ${failed}`
    );

    if (pending + processing === 0) break;

    await sleep(POLL_INTERVAL_MS);
  }

  return finalStatuses;
}

async function main(): Promise<void> {
  const startedAt = performance.now();

  console.log(`\n=== End-to-End Test: ${TOTAL_JOBS} jobs ===\n`);

  console.log("Phase 1 — Creating jobs...");

  const createResults = await Promise.allSettled(
    Array.from({ length: TOTAL_JOBS }, () => {
      const { num1, num2 } = createRandomPair();
      return createJob(num1, num2);
    })
  );

  const createdJobs = createResults
    .filter((r): r is PromiseFulfilledResult<CreatedJob> => r.status === "fulfilled")
    .map((r) => r.value);

  const createFailures = createResults.filter((r) => r.status === "rejected").length;

  console.log(`  Created: ${createdJobs.length}  |  Failed to create: ${createFailures}\n`);

  if (createdJobs.length === 0) {
    console.error("No jobs were created. Is the server running?");
    process.exitCode = 1;
    return;
  }

  console.log("Phase 2 — Polling statuses...");

  const finalStatuses = await waitForAllJobs(createdJobs);

  const completedJobs = createdJobs.filter(
    (job) => finalStatuses.get(job.jobId) === "completed"
  );
  const failedCount = createdJobs.filter(
    (job) => finalStatuses.get(job.jobId) === "failed"
  ).length;

  console.log(`\n  Settled: ${completedJobs.length} completed  |  ${failedCount} failed\n`);

  console.log("Phase 3 — Fetching and verifying results...");

  const verifications = await Promise.all(
    completedJobs.map(async (job) => {
      const result = await getResult(job.jobId);
      return { job, result };
    })
  );

  const mismatches = verifications.filter(
    ({ job, result }) => result.result.sum !== job.expectedSum
  );

  const totalTime = ((performance.now() - startedAt) / 1000).toFixed(2);

  console.log("\n=== Summary ===");
  console.log(`  Total submitted:   ${TOTAL_JOBS}`);
  console.log(`  Created:           ${createdJobs.length}`);
  console.log(`  Completed:         ${completedJobs.length}`);
  console.log(`  Failed:            ${failedCount}`);
  console.log(`  Result mismatches: ${mismatches.length}`);
  console.log(`  Total elapsed:     ${totalTime}s`);

  if (mismatches.length > 0) {
    console.error("\nMismatched results:");
    for (const { job, result } of mismatches) {
      console.error(
        `  jobId: ${job.jobId}  expected: ${job.expectedSum}  got: ${result.result.sum}`
      );
    }
    process.exitCode = 1;
    return;
  }

  if (failedCount > 0) {
    console.log("\nAll completed jobs returned correct results.");
    console.warn(`Warning: ${failedCount} job(s) failed during processing.`);
    process.exitCode = 1;
    return;
  }

  console.log("\nAll results are correct.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
