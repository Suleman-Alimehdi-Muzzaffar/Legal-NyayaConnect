# AGENTS.md

NyayaConnect legal-tech — npm workspaces, Node >=20.19 (CI pins 20.19), TS 5.9, npm `legacy-peer-deps`. CI `typecheck → lint → test → build` (`.github/workflows/ci.yml`). Run all `npm`/`tsc` from this dir; parent folder has no `package.json`.

## Layout

- `frontend/` — Vite + React Router v7 + Tailwind v4 + shadcn/new-york, `tsc --noEmit`. Never import `backend/`; share via `frontend/lib/*` or `backend/lib/*`.
- `frontend/mockup-sandbox/` — dev-only preview `:8081`, own shadcn copy, zero `@workspace/*`, ignored by eslint.
- `backend/` — Express 5 API mounted at `/api` (`src/app.ts`), esbuild bundle (`build.mjs`, `mongoose` externalized), **no watcher** — restart after backend changes.
- `frontend/lib/*`, `backend/lib/*` — export raw TS `".": "./src/index.ts"` (no dist). `db`/`api-zod`/`api-client-react` are composite (`tsc --build`); `api-spec` is spec-only (`openapi.yaml` + `orval.config.ts`).
- Root `tsconfig.json` refs libs only — never add apps. Lib→lib deps in lib's own `references`. `scripts/` is leaf package (`scripts/dev.mjs`).

## Commands

- `npm run dev` — web `:5173` (strictPort) + api `:8080` via `scripts/dev.mjs` (either death kills both). Needs `MONGODB_URI` in `backend/.env` or api exits. Single targets: `dev:web` / `dev:server` / `dev:mockups`.
- `npm run typecheck` — canonical (`tsc --build` libs then per-workspace `--noEmit`). After `lib/*` change run `typecheck:libs`; stale `.d.ts` shows as missing `@workspace/*` export. Per-workspace: `npm run typecheck --workspace @workspace/<slug>`.
- `npm run test` — vitest both apps (no DB). Per-workspace `npm run test --workspace @workspace/<slug>`, `test:watch`. Frontend jsdom+jest-dom (`src/test-setup.ts`), `*.test.*` excluded from typecheck.
- `npm run lint` — eslint flat `--max-warnings=0`; `lint:fix`, `format`/`format:fix` (prettier).
- `npm run build` — typecheck + workspace builds.
- `npm run codegen --workspace @workspace/api-spec` — Orval regen hooks+Zod from `backend/lib/api-spec/openapi.yaml` (script chains `typecheck:libs` automatically). Never hand-edit `lib/*/src/generated/**`.

## API contract (`backend/lib/api-spec/openapi.yaml`)

Source of truth (`/api`, every op needs `operationId`). Never change `info.title` (Orval forces `Api` filenames).

- Bodies must be `$ref` schemas with entity names (`NoteInput`), not `<OperationId>Body`/inline — else Zod/TS name collision (TS2308).
- Orval `useDates`/`useBigInt:true`; spec avoids by `type:number` + string dates — keep it.
- Hooks: queries `T`, mutations `{ data: T }`, errors `ApiError` (`status`/`data`). `setBaseUrl`/`setAuthTokenGetter` exist but app uses raw `fetch` + `Authorization: Bearer`.
- Most `backend/src/routes/` not in spec (multipart `/documents/:id/file`, `/verification`, `/messages*`, `/chat/support`, `/push/*`, `/match`, lawyer pricing/visibility/availability, avatar/profile, admin analytics/audit/reviews) — check routes before assuming hook exists.

## Backend (`backend/src`)

- Routers in `src/routes/` via `routes/index.ts` (exception `user-notification-preferences.ts` mounted in `app.ts`). Never prefix `/api` in route files.
- Never `console.log` — `req.log` in handlers, `logger` (`src/lib/logger.ts`) elsewhere (pino + `esbuild-plugin-pino`).
- Express 5: `/:id` params are `string|string[]` → `paramString` (`src/lib/params.ts`); wildcard `/{*splat}` not `*`; async handlers `Promise<void>` with `res.status(...).json(...); return;`.
- Auth: JWT `signToken`/`verifyToken` (`src/lib/token.ts`), 7-day expiry, secret `JWT_SECRET||ADMIN_KEY||dev-default`; bcrypt with plaintext fallback; per-route `bearerUser` (no shared middleware); in-memory token Map is cache-only. Rate-limit 20/min/IP on `/api/auth`+`/api/chat` (expect 429).
- Admin: `x-admin-key == ADMIN_KEY` (503 `admin_not_configured` if unset, 401 if wrong) — `/admin/verifications*`, `/admin/data-exports*`, `/admin/audit-logs`, `/admin/analytics`, `/admin/reviews*`.
- MongoDB required, no seed — `src/data/store.ts` or direct `db.*` both used. Lifecycles: verification `pending→approved/rejected`, data-export `pending→granted|denied`.
- Traps: `ensurePublicLawyerEntry` on lawyer register — missing Zod-required field → `GET /lawyers` 500. Private lawyers hidden from `/lawyers`/`/match`; client `visibility: public|lawyers_only|private` (default `lawyers_only`). `DELETE /account` only deletes email/userId-linked rows — don't re-add role-wide wipe.
- Uploads (multer) → gitignored `backend/data/{uploads,document-uploads,verification-uploads,avatars}/`. Google Meet optional (`GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI` else 503 `google_not_configured`); tokens `backend/data/google-tokens.json`; IST `+05:30` hard-coded; `FRONTEND_URL` overrides redirect. socket.io on api port (JWT, `user:<id>` rooms) but browser chat polls `fetch` every 3s (`frontend/src/lib/socket.ts` unwired). Web-push subs in-memory. Gemini (`GEMINI_API_KEY`) for `/chat/support`/`/match` else keyword fallback. Resend/Twilio + `node-cron` unused.

## DB (`backend/lib/db`)

- One model/file `src/models/`, `models/index.ts→index.ts`, `mongoose.models.X ?? model("X", schema)` with explicit collection, string `id` business key, `{ strict:false }`, inline subdocs `{_id:false}`. No migrations — `connectDb(uri)`/`disconnectDb()` from `@workspace/db`.
- **Never `import { models } from "mongoose"`** — externalized in `build.mjs`; use `import mongoose, { Schema, model } from "mongoose"`.

## Frontend

- Vite `base` from `BASE_PATH`, `<BrowserRouter basename>` from `BASE_URL`; `@`→`src`, `@assets`→`../attached_assets` (doesn't exist — don't use). Build `dist/public`. `vite-plugin-pwa` runtime-caches `GET /api/lawyers|/services` — suspect SW cache when API changes hide.
- Session `{token,user}` in `localStorage nyayaconnect.session` (`src/lib/auth-context.tsx`); theme/font per-account `nyayaconnect.theme.<userId>` (`src/lib/appearance.ts`); React Query `staleTime 60s, retry 1, refetchOnWindowFocus off` (`main.tsx`).
- Maps: `VITE_GOOGLE_MAPS_API_KEY` in `frontend/.env` (see `.env.example`, `DirectionsDialog.tsx`). Mockups: file must export ≥1 component at `/__mockup/preview/<path>`; plugin regens `src/.generated/mockup-components.ts` (don't edit); copy shadcn primitives to both apps.

## Env & pitfalls

- Copy `frontend/.env.example→frontend/.env`. Backend needs `MONGODB_URI` in `backend/.env` (no `.env.example` committed). Ports api 8080/web 5173/mockups 8081; web proxies `/api→http://localhost:8080` (`API_PROXY_TARGET`). Replit `PORT`/`BASE_PATH`/`REPL_ID` + Vite plugins behind `REPL_ID`.
- `postcss.config.mjs` empty — keep (guards Tailwind v4 vs ancestor v3). `.npmrc: legacy-peer-deps=true`; `overrides: esbuild 0.27.3`. Workspace deps `"*"`. `react`/`react-dom` pinned 19.1.0 — don't bump; apps keep deps in `devDependencies` except 5 runtime (`@sentry/react`, `focus-trap-react`, `react-helmet-async`, `react-router-dom`, `socket.io-client`).
- On Windows workspace links are absolute junctions — moving repo breaks `@workspace/*` → `npm install` at root.
- `git` not installed here (every `git` fails) though `.git` on `main`. Stray root file `20` is redirect artifact — ignore.
