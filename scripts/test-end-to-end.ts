const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const ADD_NUMBERS_URL = `${BASE_URL}/add-numbers`;
const STATUS_URL = (jobId: string) => `${BASE_URL}/check-numbers-state/${jobId}`;
const RESULT_URL = (jobId: string) => `${BASE_URL}/get-numbers-sum-by-job-id/${jobId}`;

const TOTAL_JOBS = Number(process.argv[2] ?? 10);
const POLL_INTERVAL_MS = 500;

type JobStatus = "pending" | "processing" | "completed" | "failed";

type LifecycleResult = {
  label: string;
  jobId: string;
  num1: number;
  num2: number;
  expectedSum: number;
  finalStatus: "completed" | "failed";
  actualSum?: number;
  matched: boolean;
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postAddNumbers(num1: number, num2: number): Promise<string> {
  const response = await fetch(ADD_NUMBERS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ num1, num2 }),
  });

  if (!response.ok) {
    throw new Error(`POST /add-numbers failed with status ${response.status}`);
  }

  const data = (await response.json()) as { jobId: string };
  return data.jobId;
}

async function getCheckNumbersState(jobId: string): Promise<JobStatus> {
  const response = await fetch(STATUS_URL(jobId));

  if (!response.ok) {
    throw new Error(`GET /check-numbers-state/${jobId} failed with status ${response.status}`);
  }

  const data = (await response.json()) as { status: JobStatus };
  return data.status;
}

async function getNumbersSumByJobId(jobId: string): Promise<number> {
  const response = await fetch(RESULT_URL(jobId));

  if (!response.ok) {
    throw new Error(`GET /get-numbers-sum-by-job-id/${jobId} failed with status ${response.status}`);
  }

  const data = (await response.json()) as { result: { sum: number } };
  return data.result.sum;
}

async function runJobLifecycle(num1: number, num2: number, index: number): Promise<LifecycleResult> {
  const expectedSum = num1 + num2;
  const label = `[job-${String(index + 1).padStart(2, "0")}]`;

  // Step 1: create the job
  const jobId = await postAddNumbers(num1, num2);
  console.log(`  ${label} created  (${num1} + ${num2})  jobId: ${jobId}`);

  // Step 2: poll /check-numbers-state/:jobId until the job settles
  let lastStatus: JobStatus = "pending";

  while (true) {
    const status = await getCheckNumbersState(jobId);

    if (status !== lastStatus) {
      console.log(`  ${label} status: ${status}`);
      lastStatus = status;
    }

    if (status === "completed" || status === "failed") break;

    await sleep(POLL_INTERVAL_MS);
  }

  // Step 3: if completed, fetch the result from /get-numbers-sum-by-job-id/:jobId
  if (lastStatus === "completed") {
    const actualSum = await getNumbersSumByJobId(jobId);
    const matched = actualSum === expectedSum;

    console.log(
      `  ${label} result: ${actualSum}  expected: ${expectedSum}  ${matched ? "OK" : "MISMATCH"}`
    );

    return { label, jobId, num1, num2, expectedSum, finalStatus: "completed", actualSum, matched };
  }

  return { label, jobId, num1, num2, expectedSum, finalStatus: "failed", matched: false };
}

async function main(): Promise<void> {
  const startedAt = performance.now();

  console.log(`\n=== End-to-End Test: ${TOTAL_JOBS} jobs ===\n`);

  const lifecycleResults = await Promise.allSettled(
    Array.from({ length: TOTAL_JOBS }, (_, i) => {
      const num1 = randomInt(1, 10000);
      const num2 = randomInt(1, 10000);
      return runJobLifecycle(num1, num2, i);
    })
  );

  const fulfilled = lifecycleResults
    .filter((r): r is PromiseFulfilledResult<LifecycleResult> => r.status === "fulfilled")
    .map((r) => r.value);

  const requestErrors = lifecycleResults.filter((r) => r.status === "rejected");
  const completed = fulfilled.filter((r) => r.finalStatus === "completed");
  const failed = fulfilled.filter((r) => r.finalStatus === "failed");
  const mismatches = completed.filter((r) => !r.matched);

  const totalTime = ((performance.now() - startedAt) / 1000).toFixed(2);

  console.log("\n=== Summary ===");
  console.log(`  Total submitted:   ${TOTAL_JOBS}`);
  console.log(`  Completed:         ${completed.length}`);
  console.log(`  Failed:            ${failed.length}`);
  console.log(`  Request errors:    ${requestErrors.length}`);
  console.log(`  Result mismatches: ${mismatches.length}`);
  console.log(`  Total elapsed:     ${totalTime}s`);

  if (mismatches.length > 0) {
    console.error("\nMismatched results:");
    for (const r of mismatches) {
      console.error(`  ${r.label}  expected: ${r.expectedSum}  got: ${r.actualSum}`);
    }
    process.exitCode = 1;
    return;
  }

  if (requestErrors.length > 0 || failed.length > 0) {
    console.log("\nSome jobs did not complete successfully.");
    process.exitCode = 1;
    return;
  }

  console.log("\nAll results are correct.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
