#### Tech Stack

##### Frontend:
- [Typescript](https://www.typescriptlang.org/) 
- [React](https://react.dev/) 
- [TailwindCSS](https://tailwindcss.com/) 
- [React Router (Data Mode)](https://reactrouter.com/start/data/installation/)
- [Lucide](https://lucide.dev/) 
- [ShadCN](https://ui.shadcn.com/) 
- [Motion](https://motion.dev/) 
- [Vite](https://vite.dev/) 
- [Tanstack Query](https://tanstack.com/query/latest/docs/framework/react/overview) 

##### Backend:
- [Supabase (Deno & PostgreSQL)](https://supabase.com/) 
- [Hono](https://hono.dev/) 
- [Node (scripting & cli only)](https://nodejs.org/en)
- [PayMongo](https://www.paymongo.com/) 
- [Drizzle](https://orm.drizzle.team/docs/get-started) 

---

### ⚙️ Local Setup 

#### 1. Prerequisites
Make sure you have:
- **Node.js 24.12.0 +** 
- **Deno** 
- **pnpm**
- **docker** 
 
#### 2. Clone and install
```bash
git clone https://github.com/isMaya404/thecozybudph 
cd thecozybudph 
pnpm i
```

#### 3. Put the correct environment variables in each given directories
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

#### 4. Run dev server
```bash
# Backend dev server (this should run first before frontend dev server):

# Linux:
dev:be:linux

# Windows:
# Make sure docker is running first then run:
dev:be:win
```

```bash
## Frontend dev server:
pnpm dev:fe
```

#### 4.5. Seed DB (Skip if alredy done once)
```bash
pnpm db:seed

## Seed script also creates an admin account. use it to access admin dashboard.
Email: admin@local.dev
Password: password123
```

#### 5. Open Website
```bash
http://localhost:5173
```

### API Docs

```bash
# OpenAPI URL
http://localhost:54321/functions/v1/<function-name>/doc

#Swagger UI URL
http://localhost:54321/functions/v1/<function-name>/ui

# functions in backend/supabase/functions/
# e.g. http://localhost:54321/functions/v1/product/doc
```
---

### 📚 Supabase Docs
```bash 
# Supabase docs starters:

# Ecosystem
https://supabase.com/docs/guides/database/overview
https://supabase.com/docs/guides/functions
https://supabase.com/docs/guides/auth
https://supabase.com/docs/guides/storage

# JS API's
https://supabase.com/docs/reference/javascript/introduction

# Supabase cli 
https://supabase.com/docs/guides/local-development/cli/getting-started
https://supabase.com/docs/reference/cli/introduction
```
---

### 📦 Installing/Updating dependencies 

```bash
# Since this project is a monorepo using pnpm workspaces: 
pnpm i <package-name> -F <workspace-name> 

e.g.
pnpm i axios -F @cozybud/frontend 
pnpm i -D dotenv -F @cozybud/backend 
pnpm i zod -F @cozybud/schemas 

# Workspaces are listed in ./pnpm-workspace.yaml

# For ShadCN components:
pnpm dlx shadcn@latest add <component-name> --cwd frontend

# Since supabase functions are isolated and is not part of pnpm workspaces:
# Install:
cd backend && pnpm supabase:install

# Add:
cd backend/supabase/functions && deno add <registry-name>:<package-name>

e.g.
deno add npm:@hono/zod-openapi 
deno add jsr:@std/testing/mock

# Update:
cd backend && pnpm supabase:update:latest
```
<br>

---
