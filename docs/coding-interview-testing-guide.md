# Async Job Processing API — Testing Guide

## Purpose

The end-to-end test script validates the full job lifecycle against a running server. It exercises all three API endpoints together and verifies that every result matches the expected sum.

---

## What the Script Does

1. Submits a configurable number of jobs concurrently, each with a random pair of numbers
2. Polls the status endpoint for every job until all of them settle
3. Fetches the result for every completed job
4. Compares the returned sum against the locally computed expected sum
5. Prints a summary with total time, completion counts, and any mismatches

---

## How to Run

Start the server first:

```bash
npm run dev
```

Then, in a separate terminal, run the script:

```bash
npm run test:e2e
```

To control the number of jobs, pass a count as an argument:

```bash
npm run test:e2e -- 50
```

The default is `10` jobs.

---

## Expected Output

```txt
=== End-to-End Test: 10 jobs ===

Phase 1 — Creating jobs...
  Created: 10  |  Failed to create: 0

Phase 2 — Polling statuses...
  pending: 10  processing: 0  completed: 0  failed: 0
  pending: 0   processing: 10  completed: 0  failed: 0
  pending: 0   processing: 0   completed: 10  failed: 0

  Settled: 10 completed  |  0 failed

Phase 3 — Fetching and verifying results...

=== Summary ===
  Total submitted:   10
  Created:           10
  Completed:         10
  Failed:            0
  Result mismatches: 0
  Total elapsed:     5.62s

All results are correct.
```

---

## What It Validates

- The create endpoint accepts concurrent requests and returns a `jobId` immediately
- Jobs transition through `pending → processing → completed` as expected
- Multiple jobs run concurrently — total elapsed time should be close to 5 seconds regardless of job count
- Each result endpoint returns the correct sum for its specific job
- No data is mixed between jobs
