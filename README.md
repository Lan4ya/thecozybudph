### Codebase Guide
---

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
- [ Supabase (Deno & PostgreSQL) ](https://supabase.com/) 
- [ Hono ](https://hono.dev/) 
- [ Node ](https://nodejs.org/en)
- [PayMongo](https://www.paymongo.com/) 
- No ORM's or Query Builders used

---

### ⚙️ Local Setup 

#### 1. Prerequisites
Make sure you have:
- **Node.js 24.12.0 +** 
- **pnpm** installed globally (yes not npm)
- **docker** 
 
#### 2. Clone and install this repository (Skip this step if you already did this once)
```bash
git clone https://github.com/isMaya404/thecozybudph 
cd thecozybudph 
pnpm i
```

#### 3. Put the correct environment variables in each given directories
<!-- ```bash -->
<!-- # ./frontend/.env -->
<!-- VITE_SUPABASE_URL= -->
<!-- VITE_SUPABASE_ANON_KEY= -->
<!-- ``` -->

```bash
# ./frontend/.env.local
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

<!-- ```bash -->
<!-- # ./backend/.env -->
<!-- SUPABASE_URL=http: -->
<!-- SUPABASE_ANON_KEY= -->
<!-- SUPABASE_SERVICE_ROLE_KEY= -->
<!-- ``` -->

```bash
# ./backend/supabase/.env
GOOGLE_CLIENT_ID=
GOOGLE_SECRET=
```

```bash
# ./backend/supabase/functions/.env
ENV=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

#### 4. Run development server
```bash
# backend dev server (this should be set up properly first for the frontend to work):

# On Windows Powershell, start docker with:
Start-Process "Docker Desktop"

# On Linux, start docker with: 
sudo systemctl start docker 

# After docker runs, if supabase is installed globally (recommended) run:
cd backend && supabase start && supabase functions serve --no-verify-jwt  # make sure you're inside ./backend dir

# If not then run:
cd backend && pnpx supabase start && pnpx supabase functions serve --no-verify-jwt
```

```bash
## frontend dev server:

# After setting up backend server, in another terminal run:

# inside root './': 
pnpm dev:frontend
```

#### 5. Open Website
```bash
http://localhost:5173
```

---

### 📚 Backend (Supabase) Development Docs
```bash 
# If you're gonna develop on backend and not familiar with supabase, here are some docs to get you started:

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
### 📦 How to add dependencies 

#### On Frontend

```bash
# General packages:

# You must be at the root: ./

# The usual "pnpm install <package-name>" won't work. You have to use:
 pnpm i <package-name> -F frontend # this installs the pkg inside frontend dir only
```
<br>

```bash
# ShadCN components:

  pnpm dlx shadcn@latest add <component-name> --cwd frontend
```

#### On Backend
```bash
# For Supabase edge functions look inside "./backend/supabase/functions/import_map.json" 
# and the package name there manually. after that it will be available on all edge functions
# (assuming deno.json inside the functions dir references the import_map)

# If only for Node scripts.
 pnpm i <package-name> -F backend 

```

---

### Seeding the database with Snaplet
```bash
# Make sure you're in ./backend
cd backend 

# Whenever your database structure changes, you will need to regenerate @snaplet/seed to keep it in sync with the new structure. You can do this by running:
pnpx @snaplet/seed sync

# Seed db:
pnpx tsx seed.ts 

# Or generate the output into supabase/seeds/**/* so it's automatically executed when you run 'supabase db reset'
pnpx tsx seed.ts > supabase/seeds/products/seed.sql
```

---

### 🖥️ How To Contribute Code 

#### Branch Model 

![Branch Model](branch_model.png)

##### main branch: production-ready features
- This is where the deployed website will source the code.  
- ⚠️ **You should not push your commits in here, open a pr, or touch this branch at all. this is where I'll merge code from dev branch only if the feature is already stable (bug free). I won't give access to this branch for safety.** ⚠️ 

##### dev branch: unstable features
- This is where you're gonna open a PR (Pull Request) - I'll explain later in the steps how.
- You should also **not** push your commits in here.

##### feature branch: feature development
- This is the branch where we’ll be working on.
- This is where you do the usual git add, commit, push commands.
- You can create as many feature branch as you want after finishing a feature and doing a pull request.

---
### Steps By Step Guide For Contributing Code:
- Just a side note. If you make a git command mistake, just google or ask AI how to undo the mistake you did. 90% of the time it's reversible.
- Tip: You can fork this repo and test/practice the steps below

<br>

##### 1. Sync your local repo to remote **dev** branch 
```bash
# you should run this regularly to detect and fix merge conflicts early (alteast 1x a day and before every git push)

# Also notice that the cmd is pulling from dev and not main. 
# That's important. Do not pull from main.
# It's always gonna be behind upstream from dev (outdated).

# skip this step if you recently just pulled.
git pull --rebase origin dev 
```

<br>

##### 2. Create a feature branch and switch to it
```bash
git branch feature/{nameOfTheFeature} # e.g. feature/event-scheduling
git switch feature/{nameOfTheFeature}

# or create and switch in one go 

git switch -c feature/{nameOfTheFeature} 
```

<br>

##### 3. Work on your feature locally and do the usual git workflow 
```bash
git add form.tsx someOtherFile.ts
git commit -m "added form for event event-scheduling"
# and other git cmd's you wanna do
```

<br>

##### 4. Push your code to your own remote branch
```bash
# Sync before pushing. If there's a merge conflict fix it.
git pull --rebase origin dev 

# push only to your own branch, not in dev nor main.
git push feature/{nameOfYourBranch} 
```
⚠️ **AFTER PUSHING, IF THE FEATURE IS NOT YET 100% COMPLETE GO BACK TO STEP 3** ⚠️

<br>

##### 5. Open a Pull Request (PR) 

##### Method 1 (Github Website):
- Go to the repo: https://github.com/isMaya404/thecozybudph  
- If you successfully pushed, you should see a green button at the top right that says “Compare & pull request”. Click it.

- After clicking the button, set these up:   
   - Base branch: dev  
   - Compare branch: feature/{nameOfYourBranch}  
   - Add a descriptive title  
   - Add clear summary of what the feature does (screenshot if it's a ui).    
   <br>

- Finally, click the "Open Pull Request" button.

##### Method 2: 
   - using gh (github cli tool) - faster but cli based

   <br>

##### 6. Code Review
- **Your code will be reviewed** (in this case, by me) and merged into the dev branch if no further changes are needed. Otherwise your code will be rejected and the reviewer will add a note as a guide on what you should improve or fix in your PR.

- If your PR is **aprroved:** go back to step 1

- If your PR is **not approved** and the reviewer requests changes:

  - **Make the requested fixes** locally in your code editor on the **same feature branch**  
  -  (Do **NOT** create a new PR or a new branch.)
  <br>

   ```bash
   # Make edits edits to your code locally... 

   git add someFile.tsx
   git commit -m "fix: address code review feedback"

   git pull origin dev # sync and resolve merge conflicts if any before pushing

   git push origin feature/{nameOfTheFeature} # this will automatically update the same PR

   # After pushing, Comment on the PR to let the reviewer know it’s ready for re-review.

   # Don't wait for the code review. After opening a PR and you wanna work on other features just go back to step 1 on the spot
   ```
