# AGENTS.md

Repo root is `Legal-NyayaConnect/` (parent dir has no `package.json`). Run all `npm`/`tsc` with `workdir="Legal-NyayaConnect"`. Node `>=20.19` (CI pins `20.19`), TS `5.9`, `legacy-peer-deps` (`.npmrc`), `overrides: esbuild 0.27.3`. CI order `typecheck → lint → test → build` (`.github/workflows/ci.yml`, `npm ci --legacy-peer-deps`).

## Layout
- `frontend/` — Vite + React Router v7 + Tailwind v4 + shadcn/new-york (`tsc --noEmit`). Never import `backend/`.
- `frontend/mockup-sandbox/` — preview `:8081`, own shadcn copy, no `@workspace/*`, ignored by eslint (`eslint.config.mjs`).
- `backend/` — Express 5 API mounted at `/api` (`src/app.ts:66`), bundled by `build.mjs` (`mongoose` externalized). No watcher — restart after changes.
- `frontend/lib/*`, `backend/lib/*` — raw TS `"*": "./src/index.ts"` (no dist). `db`/`api-zod`/`api-client-react` are composite (`tsc --build`); `api-spec` spec-only.
- Root `tsconfig.json` refs libs only — never add apps. `scripts/dev.mjs` is leaf package.

## Commands
- `npm run dev` — web `:5173` (strictPort) + api `:8080` via `scripts/dev.mjs` (either exit kills both). Needs `MONGODB_URI` in `backend/.env` or api exits. Single: `dev:web` / `dev:server` / `dev:mockups`.
- `npm run typecheck` — `tsc --build` libs then per-workspace `--noEmit`. After `lib/*` change run `typecheck:libs` first; stale `.d.ts` appears as missing `@workspace/*`. Per-workspace: `npm run typecheck --workspace @workspace/<slug>`.
- `npm run test` — vitest both apps, no DB. `npm run test --workspace @workspace/<slug>`, `test:watch`. Frontend jsdom+jest-dom (`src/test-setup.ts`); `*.test.*` excluded from typecheck.
- `npm run lint` — eslint flat config `--max-warnings=0`; `lint:fix`, `format`/`format:fix` (prettier).
- `npm run build` — typecheck + workspace builds.
- `npm run codegen --workspace @workspace/api-spec` — Orval from `backend/lib/api-spec/openapi.yaml` (auto `typecheck:libs`). Never hand-edit `lib/*/src/generated/**`.

## API contract (`backend/lib/api-spec/openapi.yaml`)
Source of truth (`/api`, every op needs `operationId`). Don't change `info.title` — Orval forces `Api` filenames (`orval.config.ts:9`).
- Bodies must be `$ref` schemas with entity names (`NoteInput`), not inline — else Zod/TS collision TS2308.
- `useDates`/`useBigInt:true` (`orval.config.ts:67`); keep `type:number` + string dates in spec.
- Hooks: queries `T`, mutations `{ data: T }`, errors `ApiError` (`status`/`data`). `setBaseUrl`/`setAuthTokenGetter` exist but app uses raw `fetch` + `Authorization: Bearer`.
- Many routes NOT in spec (`/documents/:id/file`, `/verification`, `/messages*`, `/chat/support`, `/push/*`, `/match`, lawyer pricing/visibility/availability, avatar/profile, admin analytics/audit/reviews) — check `backend/src/routes/` before assuming hook exists.

## Backend (`backend/src`)
- Routers `src/routes/` via `routes/index.ts` (except `user-notification-preferences.ts` mounted in `app.ts:67`). Never prefix `/api` in route files.
- Never `console.log` — `req.log` in handlers, `logger` (`src/lib/logger.ts`) elsewhere (pino + `esbuild-plugin-pino`).
- Express 5: `/:id` is `string|string[]` → `paramString` (`src/lib/params.ts`); wildcard `/{*splat}` not `*`; async handlers `Promise<void>` with `res.status(...).json(...); return;`.
- Auth: `signToken`/`verifyToken` (`src/lib/token.ts`), 7-day JWT, secret `JWT_SECRET||ADMIN_KEY||dev-default`; bcrypt with plaintext fallback; per-route `bearerUser` (no shared middleware); in-memory token Map is cache-only. Rate-limit 20/min/IP on `/api/auth`+`/api/chat` (`app.ts:56`, expect 429).
- Admin: `x-admin-key == ADMIN_KEY` (503 `admin_not_configured` if unset) — `/admin/verifications*`, `/admin/data-exports*`, `/admin/audit-logs`, `/admin/analytics`, `/admin/reviews*`.
- Mongo required, no seed. Lifecycles: verification `pending→approved/rejected`, data-export `pending→granted|denied`.
- Traps: `ensurePublicLawyerEntry` on lawyer register — missing Zod-required field → `GET /lawyers` 500. Private lawyers hidden from `/lawyers`/`/match`; client `visibility: public|lawyers_only|private` (default `lawyers_only`). `DELETE /account` only deletes email/userId-linked rows. Multer → `backend/data/{uploads,document-uploads,verification-uploads,avatars}/` (gitignored). Google Meet optional (`GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI` else 503, IST `+05:30`). socket.io on api port (`user:<id>` rooms) but browser polls every 3s (`frontend/src/lib/socket.ts` unwired). Gemini (`GEMINI_API_KEY`) fallback to keywords. Resend/Twilio + `node-cron` unused.

## DB (`backend/lib/db`)
- One model/file `src/models/`, `models/index.ts→index.ts`, `mongoose.models.X ?? model("X", schema)` with explicit collection, string `id` key, `{ strict:false }`, inline `{_id:false}`. No migrations — `connectDb`/`disconnectDb` from `@workspace/db`.
- Never `import { models } from "mongoose"` — externalized in `build.mjs:54`; use `import mongoose, { Schema, model } from "mongoose"`.

## Frontend
- Vite `base` from `BASE_PATH`, `<BrowserRouter basename>` from `BASE_URL`; `@`→`src`, `@assets`→`../attached_assets` (nonexistent — don't use). Build `dist/public`. PWA runtime-caches `GET /api/lawyers|/services` (`vite.config.ts:41`) — suspect SW cache when API changes hide.
- Session `{token,user}` in `localStorage nyayaconnect.session` (`src/lib/auth-context.tsx`); theme/font per-account `nyayaconnect.theme.<userId>` (`src/lib/appearance.ts`); React Query `staleTime 60s, retry 1, refetchOnWindowFocus off`.
- Maps: `VITE_GOOGLE_MAPS_API_KEY` in `frontend/.env` (`.env.example`). Mockups: file must export ≥1 component at `/__mockup/preview/<path>`; plugin regens `src/.generated/mockup-components.ts` (don't edit).

## Env & pitfalls
- `frontend/.env.example → frontend/.env`. Backend needs `MONGODB_URI` in `backend/.env` (no example). Ports 8080/5173/8081; web proxies `/api→http://localhost:8080` (`API_PROXY_TARGET`). Replit `PORT`/`BASE_PATH`/`REPL_ID` + Vite plugins behind `REPL_ID`.
- `postcss.config.mjs` empty — keep (guards Tailwind v4 vs ancestor v3). `.npmrc: legacy-peer-deps=true`; workspace deps `"*"`. `react`/`react-dom` pinned `19.1.0` — don't bump; apps keep deps in `devDependencies` except `@sentry/react`, `focus-trap-react`, `react-helmet-async`, `react-router-dom`, `socket.io-client`.
- On Windows workspace links are absolute junctions — moving repo breaks `@workspace/*` → `npm install` at repo root.
- Stray `Legal-NyayaConnect/20` is binary redirect artifact — ignore.
