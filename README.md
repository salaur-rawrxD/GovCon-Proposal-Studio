# GovCon Proposal Studio

Next.js app for uploading RFPs, running server-side analysis (compatibility, compliance, risks), and drafting proposal sections with a chat-assisted editor. See `.env.example` for configuration.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase credentials, the app uses an in-memory store and mock AI (see `lib/config.ts`).

## GitHub and Vercel (demo + production)

Step-by-step instructions: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** (create the GitHub repo, import to Vercel, split **Production** vs **Preview** env vars, optional Supabase staging).

Quick links:

- [Create a GitHub repository](https://github.com/new)
- [Import project on Vercel](https://vercel.com/new)

## Scripts

- `npm run dev` — development with Turbopack
- `npm run build` — production build
- `npm run lint` — ESLint

## License

Private / your organization.
