# EduSwap — Client

React + Vite + TypeScript frontend for EduSwap.

## Design system

- **Display** — Fraunces (serif) for headings
- **Body** — Inter
- **Mono** — JetBrains Mono for course codes and data
- **Primary** — indigo "ink" · **Accent** — amber "highlighter"
- Full light/dark theming via CSS variables (`src/index.css`), Tailwind-mapped

## Structure

```
src/
├── components/   reusable UI (ui/ = shadcn primitives) + route guards
├── context/      ThemeProvider (dark mode), AuthProvider (session)
├── services/     axios client (silent refresh), authService, queryClient
├── layouts/      AppLayout, AuthLayout, AdminLayout
├── pages/        route screens (placeholders until their feature phase)
├── hooks/        useDebounce, ...
├── types/        shared DTOs mirroring the server
├── utils/        cn(), route + query-key constants
├── router.tsx    route table with protected + role routes
└── App.tsx       provider composition
```

## Requirements

- Node.js >= 18.18
- The backend running (see `../server`)

## Setup

```bash
cp .env.example .env      # set VITE_API_URL (defaults to http://localhost:5000)
npm install
npm run dev               # http://localhost:5173
```

## Scripts

| Script            | Purpose                              |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Vite dev server with HMR             |
| `npm run build`   | Type-check + production build        |
| `npm run preview` | Preview the production build         |
| `npm run typecheck` | Type-check only                    |

## What works now (Phase 3)

- Routing with protected + admin-only guards
- Dark/light theme toggle (persisted)
- Axios instance with automatic access-token refresh on 401
- TanStack Query + toast infrastructure
- Landing page; auth/resource/admin screens are scaffolded placeholders

Auth forms and real data wire in from Phase 4 onward.
