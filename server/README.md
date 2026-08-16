# EduSwap — Server

Express + TypeScript API for the EduSwap student marketplace.

## Architecture

Requests flow strictly in one direction through the layers:

```
route → middleware → controller → service → repository → model
```

- **controllers** never touch Mongoose directly — only repositories do
- **services** hold business logic and orchestrate repositories
- **app.ts** builds the Express app with no side effects (test-friendly)
- **server.ts** connects the DB, starts HTTP, and handles graceful shutdown

## Requirements

- Node.js >= 18.18
- A MongoDB connection string (MongoDB Atlas or local)

## Setup

```bash
cp .env.example .env      # then fill in MONGODB_URI + JWT secrets
npm install
npm run dev               # starts on http://localhost:5000 with hot reload
```

## Scripts

| Script            | Purpose                                  |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Hot-reloading dev server (tsx)           |
| `npm run build`   | Compile TypeScript to `dist/`            |
| `npm start`       | Run the compiled server (production)     |
| `npm run typecheck` | Type-check without emitting            |
| `npm run format`  | Format with Prettier                     |

## Health check

```bash
curl http://localhost:5000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "message": "EduSwap API is healthy",
  "data": {
    "status": "ok",
    "uptime": 3,
    "timestamp": "2026-01-01T00:00:00.000Z",
    "database": "connected"
  }
}
```
