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
- **pnpm**
- **Docker** 
 
### 2. Clone and install
```bash
git clone https://github.com/isMaya404/thecozybudph 
cd thecozybudph 
pnpm i
```

### 3. Set env vars per directory
```bash
# ./frontend/.env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

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
DB_TX_POOLER_URL=

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
pnpm dev
```

Running supabase and frontend dev server separately:
```bash
pnpm dev:sb
```
```bash
pnpm dev:fe
```

### 4.5. Seed DB (Skip if alredy done once)
```bash
pnpm db:seed
```

Part of seed script pipeline creates an admin account. Use it for login to access admin dashboard.
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

This project uses a PNPM monorepo.
Workspace definitions are located in:

```txt
./pnpm-workspace.yaml
```

### Install a package into a specific workspace

```bash
pnpm i <package-name> -F <workspace-name>
```

Examples:

```bash
pnpm i axios -F @cozybud/frontend
```

```bash
pnpm i -D dotenv -F @cozybud/backend
```

```bash
pnpm i zod -F @cozybud/schemas
```

---

### 🎨 ShadCN Components

Add components to the frontend workspace:

```bash
pnpm dlx shadcn@latest add <component-name> --cwd frontend
```

Example:

```bash
pnpm dlx shadcn@latest add button --cwd frontend
```

---

### ⚡ Supabase Functions (Deno Workspace)

Supabase Functions use a dedicated Deno workspace config located at:

```txt
./backend/supabase/functions/deno.json
```

### Add a dependency

```bash
pnpm add:sb <registry-name>:<package-name>
```

Examples:

```bash
pnpm add:sb npm:@hono/zod-openapi
```

```bash
pnpm add:sb jsr:@std/testing/mock
```

### Update dependencies

```bash
pnpm update:sb
```

```bash
pnpm update:latest:sb
```

---

## 🧪 Supabase Function Tests

Integration tests intentionally use a separate Deno workspace.

This avoids coupling:

* test execution
* runtime module resolution
* dependency graphs
* environment initialization

with the production Supabase Functions runtime.

### Add a test dependency

```bash
pnpm add:sb:tests <registry-name>:<package-name>
```

### Update test dependencies

```bash
pnpm update:sb:tests

```
```bash
pnpm update:latest:sb:tests
```
---

## LOC as of 05/18/26
```bash
❯ tokei . \
  --exclude node_modules \
  --exclude dist \
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
 CSS                       3          246          196           11           39
 HTML                      1           17           17            0            0
 JavaScript                3           59           49            3            7
 SQL                      94         1080          832           41          207
 TSX                     162        17394        15378          271         1745
 TypeScript              295        20432        17296         1017         2119
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Total                   558        39228        33768         1343         4117
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
