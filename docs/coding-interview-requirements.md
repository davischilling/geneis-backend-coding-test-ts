# Async Job Processing API — Problem Statement & Requirements

## Overview

The goal is to design an API that receives tasks, processes them in the background with a 5-second simulated delay, supports concurrent execution, exposes job state, and returns results when processing is complete.

---

## Business Scenario

The system receives a pair of numbers:

```json
{
  "num1": 10,
  "num2": 20
}
```

The sum must **not** be calculated synchronously during the HTTP request.

Instead, the system must:

1. Create a job
2. Return a job identifier immediately
3. Process the job asynchronously
4. Wait 5 seconds to simulate heavy work
5. Store the result
6. Allow clients to query status and result later

---

## Core Requirements

## 1. Create Job Endpoint

Provide an endpoint that receives two numbers and creates a processing job.

### Expected Behavior

* Validate input
* Generate a unique `jobId`
* Persist job state in memory or chosen storage
* Start background processing
* Return immediately

### Request Example

```json
{
  "num1": 5,
  "num2": 8
}
```

### Response Example

```json
{
  "jobId": "abc-123",
  "status": "pending"
}
```

---

## 2. Background Processing

Each job must run asynchronously and simulate expensive work.

### Rules

* Wait 5 seconds
* Compute `num1 + num2`
* Save result
* Update job state

---

## 3. Concurrent Execution

Multiple jobs must run independently.

### Example

* Job A starts at 10:00:00
* Job B starts at 10:00:01
* Job A completes around 10:00:05
* Job B completes around 10:00:06

Job B must not wait for Job A.

---

## 4. Job Status Tracking

Each job must expose a lifecycle state.

### Allowed Status Values

* `pending`
* `processing`
* `completed`
* `failed`

---

## 5. Check Status Endpoint

Provide an endpoint that returns current job status.

### Check Status - Response Example

```json
{
  "jobId": "abc-123",
  "status": "processing"
}
```

---

## 6. Get Result Endpoint

Provide an endpoint that returns the processed result.

### Completed Response

```json
{
  "jobId": "abc-123",
  "status": "completed",
  "input": {
    "num1": 5,
    "num2": 8
  },
  "result": {
    "sum": 13
  }
}
```

### If Not Ready Yet

```json
{
  "message": "Job not completed yet"
}
```

---

## 7. Job Not Found

Unknown job ids must return an appropriate error.

### Not Found - Response Example

```json
{
  "message": "Job not found"
}
```

---

## 8. Input Validation

Both numbers are required and must be valid numeric values.

### Invalid Example

```json
{
  "num1": "abc",
  "num2": true
}
```

---

## Routes

* `POST /add-numbers`
* `GET /check-numbers-state/:jobId`
* `GET /get-numbers-sum-by-job-id/:jobId`
