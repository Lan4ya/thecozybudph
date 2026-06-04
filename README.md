## Tech Stack

### Frontend:
- [Typescript](https://www.typescriptlang.org/) 
- [React](https://react.dev/) 
- [TailwindCSS](https://tailwindcss.com/) 
- [React Router (Data Mode)](https://reactrouter.com/start/data/installation/)
- [Lucide](https://lucide.dev/) 
- [ShadCN](https://ui.shadcn.com/) 
- [Motion](https://motion.dev/) 
- [Vite](https://vite.dev/) 
- [Tanstack Query](https://tanstack.com/query/latest/docs/framework/react/overview) 

### Backend:
- [Supabase (Deno & PostgreSQL)](https://supabase.com/) 
- [Hono](https://hono.dev/) 
- [Node (scripting & cli only)](https://nodejs.org/en)
- [PayMongo](https://www.paymongo.com/) 
- [Drizzle](https://orm.drizzle.team/docs/get-started) 

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

### 3. Set env vars per directory
```bash
# ./frontend/.env.local
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

```bash
# ./backend/.env
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
ENV=development
APP_URL=http://localhost:5173
```

```bash
# ./backend/supabase/.env
# Google OAuth:
GOOGLE_CLIENT_ID=
GOOGLE_SECRET=

# Google SMTP:
GOOGLE_APP_USERNAME=
GOOGLE_APP_PASSWORD=
```

```bash
# ./backend/supabase/functions/.env
PAYMONGO_PUBLIC_KEY=
PAYMONGO_SECRET_KEY=
PAYMONGO_CHECKOUT_WEBHOOK_SECRET=

LALAMOVE_PUBLIC_KEY=
LALAMOVE_SECRET_KEY=

GEOAPIFY_API_KEY=

ENV=development 
APP_URL=https://thecozybudph.com
```

### 4. Run dev server

Make sure docker in running first, then run:
```bash
pn dev
```

### 4.5. Seed DB 

Note: Do NOT spam this script since you'll get hit with rate limit and the script will not work for a while
```bash
pn db:seed
```

Part of seed script creates an admin account. Use it for login to access admin dashboard.
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

This project uses a pn monorepo.
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

### Updating dependencies

```bash
pn update:sb
```

```bash
pn update:latest:sb
```

---

## 🧪 Supabase Edge Function Tests

Integration tests intentionally use a separate Deno workspace.

This avoids coupling:

* test execution
* runtime module resolution
* dependency graphs
* environment initialization

with the production Supabase Functions runtime.

### Running all integration tests
```bash
pn test:sb
```

### Add a test dependency
```bash
pn add:sb:tests <registry-name>:<package-name>
```

### Update test dependencies
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

## TODO:

* merge redundant domain types into api types inferred from zod schemas
* create a script that optimizes images with sharp and uploads assets into storage at build time, and let the app consume it via a manifest
- determine CI strategy for Supabase Edge Function tests (local Supabase Docker startup vs external deployed env vs exclusion from CI due to runtime overhead)

<br>

---

## LOC as of 06/03/26
```bash
❯ tokei . \
  --exclude node_modules \
  --exclude 'dist*' \
  --exclude build \
  --exclude .git \
  --exclude '*.xml' \
  --exclude '*.json' \
  --exclude '*.yaml' \
  --exclude '*.toml' \
  --exclude '*.svg' \
  --exclude '*.md' \

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Language              Files        Lines         Code     Comments       Blanks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CSS                       3          252          201           11           40
 HTML                      3          299          287            8            4
 JavaScript                2           59           52            1            6
 SQL                      98         1217          939           56          222
 TSX                     182        20167        17967          300         1900
 TypeScript              362        29274        25170         1427         2677
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Total                   650        51268        44616         1803         4849
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
