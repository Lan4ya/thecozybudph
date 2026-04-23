# Copilot Instructions for `thecozybudph`

## Build, test, lint, and local dev commands

Use **pnpm** (not npm) and Node **24+**.

| Task | Command |
| --- | --- |
| Install workspace deps | `pnpm install` |
| Run frontend dev server | `pnpm dev:frontend` |
| Run backend edge functions locally | `pnpm dev:backend` |
| Build all workspace packages | `pnpm build` or `pnpm -r build` |
| Build frontend only | `pnpm build:frontend` |
| Build backend only | `pnpm --filter backend build` |
| Build shared types package only | `pnpm --filter @TheCozyBud/types build` |
| Lint frontend | `pnpm --filter frontend lint` |
| Type-check frontend | `pnpm --filter frontend type` |
| Run frontend tests | `pnpm --filter frontend test` |
| Run a single frontend test file | `pnpm --filter frontend test -- --run src/path/to/file.test.ts` |
| Run a single frontend test by name | `pnpm --filter frontend test -- --run -t "test name"` |
| Generate shared Supabase types and sync into edge functions | `pnpm --filter backend pkg:generate-types` |
| Generate Drizzle migration + apply Supabase migrations | `pnpm --filter backend db:apply-schemas` |

## High-level architecture

This is a pnpm monorepo with three primary surfaces:

1. `frontend/`: React 19 + Vite + React Router (data loaders) + TanStack Query.
2. `backend/`: Supabase Edge Functions (Deno) using Hono + Drizzle over Postgres.
3. `packages/types/`: shared TypeScript contracts (API/domain/schema/supabase types) used by frontend and backend.

### Request flow (frontend to backend)

Frontend API modules call `apiClient` (`frontend/src/lib/axios/client.ts`), which:
- targets `${VITE_SUPABASE_URL}/functions/v1`
- injects Supabase access token into `Authorization`
- unwraps API responses from `{ data: ... }` to raw payload

Edge functions are grouped by domain (`address`, `cart`, `checkout`, `payment`, `product`, `profile`). Each domain function follows a layered flow:

`<domain>/index.ts` → `<domain>-routes.ts` → `<domain>-handlers.ts` → `_shared/modules/<domain>/application/*` → repository + Drizzle schema.

Common middleware, db client, errors, utils, and integrations live under `backend/supabase/functions/_shared`.

## Key codebase conventions

1. **Path aliases are required**
   - Frontend uses `@/*` → `frontend/src/*`.
   - Edge functions use import map alias `@shared/` → `backend/supabase/functions/_shared/`.

2. **Backend response shape is standardized**
   - Success responses should go through `handleSuccess(...)` and return `{ data: ... }`.
   - Backend converts snake_case payload keys to camelCase before responding (`_shared/utils/caseConverter.ts`).
   - Frontend assumes this contract and consumes unwrapped typed payloads.

3. **Validation and errors are centralized**
   - Route validation uses `zodValidatorMiddleware(...)`.
   - Validation failures throw `ValidationError` with `{ field?, message }[]`.
   - Domain/application failures use `AppError` helpers (`badRequest`, `forbidden`, `notFound`, etc.).
   - Function-level `onError` delegates to shared error handling (`_shared/errors/errorHandler.ts`).

4. **DB access policy in edge functions**
   - Use `drizzleMiddleware` + `requireVariables(c, ...)` to access request-scoped dependencies.
   - Prefer `db.rls(...)` for row-level-security-aware access.
   - `db.admin` is guarded and should only be used for admin-authorized flows.

5. **Shared type contracts are a first-class dependency**
   - Frontend imports runtime/compile-time API and domain types from `@TheCozyBud/types`.
   - `pkg:generate-types` updates `packages/types/src/supabase.types.ts` and syncs them into backend `_shared/package-types`.
