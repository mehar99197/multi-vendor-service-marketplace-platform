# Deployment Guide

The frontend and backend deploy as **two separate Vercel projects from the same repo**
(each with its own Root Directory). MongoDB is hosted on **Atlas**, images on **Cloudinary** —
same credentials in every environment.

> The backend is already serverless-ready: `server.js` exports the Express `app` and only calls
> `app.listen()` when `NODE_ENV !== 'production'`, and `config/db.js` caches the Mongoose
> connection on `globalThis` so Vercel's serverless functions reuse one connection. No
> `vercel.json` is required for the backend (Vercel auto-detects Express, Sept 2025+).

## 0. Prerequisites
- **Atlas Network Access** must include `0.0.0.0/0` — Vercel functions egress from dynamic IPs, so a fixed IP allow-list will fail intermittently.
- Vercel CLI ≥ 47.0.5: `npm i -g vercel` then `vercel login`.

## 1. Backend → Vercel project (Express serverless)
From the repo:
```bash
cd backend
vercel            # first run: link/create project; accept Vite/Node detection
vercel --prod     # production deploy
```
Set environment variables (Dashboard → project → Settings → Environment Variables, or `vercel env add`):

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | your Atlas SRV string incl. password and `/marketplace` db |
| `JWT_SECRET` | long random string |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | from Cloudinary |
| `CLIENT_URL` | the deployed **frontend** origin (set after step 2); comma-separated for multiple |

Vercel sets `NODE_ENV=production` automatically, so the app runs as a function (no `app.listen`).
Health check: `https://<backend>.vercel.app/api/health` → `{ "status": "ok" }`.

## 2. Frontend → Vercel project (Vite SPA)
```bash
cd frontend
vercel --prod
```
- Framework preset **Vite**, build `npm run build`, output `dist` — all auto-detected.
- [`frontend/vercel.json`](frontend/vercel.json) provides the SPA rewrite so routes like `/dashboard` survive a hard refresh.
- Set env var **`VITE_API_URL`** = `https://<backend>.vercel.app/api`.
  ⚠️ `VITE_*` vars are **baked in at build time** — after changing it you must **redeploy**. Never put secrets behind a `VITE_` prefix (they ship in the client bundle).

## 3. Wire them together
1. Deploy the backend (step 1), note its URL.
2. Set the frontend's `VITE_API_URL` = `<backend-url>/api`, deploy the frontend (step 2).
3. Set the backend's `CLIENT_URL` = the frontend origin (no trailing slash) and redeploy the backend so CORS allows it.
4. Register, log in, and test an image upload end-to-end.

## Gotchas (verified against Vercel docs, 2026)
- **4.5 MB request-body limit** (hard, platform-enforced). The upload limit is set to 4 MB to stay safely under it. For larger files, switch to a **signed direct browser→Cloudinary upload** (backend returns only a signature; the file never passes through the function) — see notes in `controllers/upload.js`.
- **CORS:** `Access-Control-Allow-Origin` can't be `*` with credentials; `CLIENT_URL` must name the exact frontend origin. Preview deployments get changing `*.vercel.app` subdomains — add each (or the stable production domain) to `CLIENT_URL`.
- The repo has no root `package.json`; deploy `frontend/` and `backend/` as **separate** projects, never the repo root.

## Alternative: backend on Render
If you prefer a long-running server for the backend, [`backend/render.yaml`](backend/render.yaml)
deploys it on Render (root dir `backend`, `npm start`). Use the same env vars. The frontend still
goes on Vercel; point `VITE_API_URL` at the Render URL and set `CLIENT_URL` to the Vercel frontend.
