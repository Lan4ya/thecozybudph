## Tech Stack

### Frontend:

- [Typescript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [React Router (data mode)](https://reactrouter.com/start/data/installation/)
- [Lucide](https://lucide.dev/)
- [ShadCN](https://ui.shadcn.com/)
- [Motion](https://motion.dev/)
- [Vite](https://vite.dev/)
- [Tanstack Query](https://tanstack.com/query/latest/docs/framework/react/overview)

### Backend:

- [Supabase](https://supabase.com/)
- [Hono](https://hono.dev/)
- [Node (scripting only)](https://nodejs.org/en)
- [Drizzle](https://orm.drizzle.team/docs/get-started)
- [PayMongo (payment gateway)](https://www.paymongo.com/)
- [Lalamove API (product shipment booking)](https://developers.lalamove.com/#introduction-change-log)

---

## ⚙️ Local Setup

### 1. Prerequisites

Make sure you have:

- **Node.js 24.12.0 +**
- **Deno**
- **pnpm 11.0.1 +**
- **Docker**

### 2. Clone and install

```bash
git clone https://github.com/Lan4ya/thecozybudph
cd thecozybudph
pn i
```

### 3. Set env vars for all listed directories

```bash
# ./frontend/.env.local

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_CF_TURNSTILE_SITE_KEY=
VITE_APP_URL=http://localhost:5173
```

```bash
# /backend/.env
# Used by Node scripts

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=

PAYMONGO_PUBLIC_KEY=
PAYMONGO_SECRET_KEY=

PAYMONGO_WEBHOOK_SECRET=

LALAMOVE_PUBLIC_KEY=
LALAMOVE_SECRET_KEY=
LALAMOVE_WEBHOOK_SERCRET=

ENV=development
APP_URL=http://localhost:5173
```

```bash
# ./backend/supabase/.env
# Used by Supabase functions, Supabase config.toml, and Supabase tests

# Supabase functions doesn't need these SUPABASE vars since it injects them
# automatically when running locally, this is used solely by tests. We can
# safely ignore supabase's warning 'Env name cannot start with SUPABASE_'
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=

PAYMONGO_PUBLIC_KEY=
PAYMONGO_SECRET_KEY=
PAYMONGO_CHECKOUT_WEBHOOK_SECRET=

LALAMOVE_PUBLIC_KEY=
LALAMOVE_SECRET_KEY=

GEOAPIFY_API_KEY=

# Cloudflare turnstile
CF_TURNSTILE_SECRET_KEY=

ENV=development
APP_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_SECRET=

# SMTP
RESEND_API_KEY=
```

### 4. Run dev server

Make sure docker in running first, then run:
```bash
pn dev
```

### 4.5. Seed DB
```bash
pn db:seed
```

Part of seed script creates an admin account. Use it on login to access admin dashboard.
```bash
email: admin@local.dev
password: password123
```

### 5. Open Website
```bash
http://localhost:5173
```

---

## 📦 Managing Dependencies

### PNPM Workspace Packages

This project uses a pnpm monorepo.
Workspace definitions are located in:

```txt
./pnpm-workspace.yaml
```

### Install a package into a specific workspace

```bash
pn i <package-name> -F <workspace-name>
```

Examples:

```bash
pn i axios -F @cozybud/frontend
```

```bash
pn i -D dotenv -F @cozybud/backend
```

```bash
pn i zod -F @cozybud/schemas
```

---

### 🎨 ShadCN Components

Add components to the frontend workspace:

```bash
pn dlx shadcn@latest add <component-name> --cwd frontend
```

Example:

```bash
pn dlx shadcn@latest add button --cwd frontend
```

---

### ⚡ Supabase Functions (Deno Workspace)

Supabase Functions use a dedicated Deno workspace config located at:

```txt
./backend/supabase/functions/deno.json
```

### Adding dependency

```bash
pn add:sb <registry-name>:<package-name>
```

Examples:

```bash
pn add:sb npm:@hono/zod-openapi
```

```bash
pn add:sb jsr:@std/testing/mock
```

### Removing dependency

```bash
pn remove:sb <registry-name>:<package-name>
```

### Updating dependencies

```bash
pn update:sb
```

```bash
pn update:latest:sb
```

---

## 🧪 Supabase Function Tests

Tests intentionally use a separate Deno workspace for isolation.

### Running all integration tests

```bash
pn test:sb
```

### Adding test dependency

```bash
pn add:sb:tests <registry-name>:<package-name>
```
### Removing test dependency

```bash
pn remove:sb:tests <registry-name>:<package-name>
```

### Updating test dependencies

```bash
pn update:sb:tests

```

```bash
pn update:latest:sb:tests
```

---

## API Docs

### Open API URL

```bash
http://localhost:54321/functions/v1/<function-name>/doc
```

### Swagger UI URL

```bash
http://localhost:54321/functions/v1/<function-name>/ui
```

Examples:

```bash
http://localhost:54321/functions/v1/order/doc
```

```bash
http://localhost:54321/functions/v1/order/ui
```
---

<br>

## LOC as of 06/22/26

```bash
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Language              Files        Lines 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CSS                       3          258 
 HTML                      3          299 
 JavaScript                2           80 
 SQL                     114         1358 
 TSX                     186        21942 
 TypeScript              418        36290 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Total                   726        60227 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
