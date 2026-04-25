# GitHub and Vercel (demo + production)

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs `lint` and `build` on pushes to `main`, `develop`, and `demo`, and on pull requests targeting `main`. Vercel still builds each deployment independently.

## 1. Create the GitHub repository

On [github.com/new](https://github.com/new):

- Name: e.g. `govcon-proposal-studio`
- Leave “Add a README” **unchecked** if you already have commits locally (avoids merge conflicts).

From this project directory (with your changes committed):

```bash
git remote add origin https://github.com/YOUR_ORG/govcon-proposal-studio.git
git push -u origin main
```

If you use the [GitHub CLI](https://cli.github.com/) (`gh auth login` first):

```bash
gh repo create YOUR_ORG/govcon-proposal-studio --private --source=. --remote=origin --push
```

## 2. Connect Vercel

1. Open [vercel.com/new](https://vercel.com/new) and **Import** the GitHub repository.
2. **Framework preset:** Next.js (auto-detected).
3. **Root directory:** repository root (default).
4. **Build & Output:** defaults (`npm run build`, output handled by Next.js).

Do not commit secrets. Configure them in Vercel only (see below).

## 3. Two environments on Vercel

Vercel gives you:

| Type | Typical use | URL |
|------|----------------|-----|
| **Production** | Live product; `main` (or your production branch) | Your production domain + `*.vercel.app` production alias |
| **Preview** | PRs and non-production branches (good for **demo / staging**) | Unique `*.vercel.app` per deployment |

**Recommended branch setup**

- **`main`** → **Production** (real Supabase + production env vars).
- **`demo`** or **`develop`** → open a pull request into `main`, or set that branch to deploy as Preview; every push gets a stable-enough preview URL for stakeholders. You can also promote a Preview to Production from the Vercel dashboard when ready.

**Optional: second Vercel project**  
If you want a **fixed demo URL** separate from PR previews, create a second Vercel project pointing at the same repo, set **Production Branch** to `demo`, and attach a custom subdomain (e.g. `demo.yourdomain.com`).

## 4. Environment variables

In **Vercel → Project → Settings → Environment Variables**, add:

| Name | Production | Preview (demo / staging) |
|------|------------|---------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production Supabase URL | Staging Supabase URL (or leave empty to use in-memory store) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production anon key | Staging anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production service role (**server only**) | Staging service role |
| `AI_MOCK_MODE` | `false` when your model is wired | `true` for safe demos without API cost |
| `DEMO_MODE` | `false` or unset | `true` only if you want to **force** in-memory storage (overrides Supabase) |

Apply **Production** to the `main` (or production) branch; apply **Preview** to Preview deployments. Use **Development** for `vercel dev` if you want local overrides.

After changing env vars, **redeploy** the affected deployments from the Vercel dashboard.

## 5. Supabase for production vs demo

- **Production:** run `supabase/migrations/001_init.sql` on the production database, create the `rfp-documents` bucket, and use `SUPABASE_SERVICE_ROLE_KEY` only on the server (Vercel serverless / API routes).
- **Demo / staging:** create a **separate** Supabase project (or skip URL + service key so the app uses the built-in in-memory store and `AI_MOCK_MODE=true`).

## 6. Custom domains

**Vercel → Project → Settings → Domains:** add `app.yourdomain.com` for production and, if needed, `demo.yourdomain.com` for a preview or second project.
