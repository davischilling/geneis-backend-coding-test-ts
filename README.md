# Backend Coding Test — TypeScript

A pre-configured TypeScript + Fastify + Zod starter project. Everything is set up so you can focus on writing code.

## Getting Started

```bash
npm install
npm run dev
```

The server starts on `http://localhost:3000`. A health check is available at `GET /health`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output |
| `npm run typecheck` | Type-check without emitting |

## Stack

- **Runtime:** Node.js
- **Language:** TypeScript (strict mode)
- **Framework:** [Fastify](https://fastify.dev/)
- **Validation:** [Zod](https://zod.dev/)

## API Endpoints

### Numbers API (with Concurrency Support)

- `POST /add-numbers` - Add numbers with async processing
- `GET /check-numbers-state/:jobId` - Check job status
- `GET /get-numbers-sum-by-job-id/:jobId` - Get job result

See `REST.http` for example requests.

## Features

✨ **Concurrent Request Handling** - Multiple requests processed simultaneously without blocking

🔄 **Asynchronous Processing** - Background task processing with 5-second delay

🆔 **Task Tracking** - Each request gets a unique ID for status monitoring

📊 **Task Status Management** - Track pending, success, and failed tasks

🧪 **Load Testing Scripts** - Built-in scripts to test concurrent behavior

For more details on load testing, see [docs/LOAD_TEST_GUIDE.md](docs/LOAD_TEST_GUIDE.md)
