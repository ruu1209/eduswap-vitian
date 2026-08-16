# Deploying EduSwap

EduSwap deploys as two apps plus a managed database:

- **Backend** → Render (from `server/`)
- **Frontend** → Vercel (from `client/`)
- **Database** → MongoDB Atlas
- **File storage** → Cloudinary
- **Email (OTP / password reset)** → any SMTP provider (optional in dev)

## 1. Provision services

### MongoDB Atlas
1. Create a free cluster and a database user.
2. Under Network Access, allow access from anywhere (`0.0.0.0/0`) so Render can connect.
3. Copy the connection string → this is `MONGODB_URI` (append `/eduswap`).

### Cloudinary
Create an account and copy `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
`CLOUDINARY_API_SECRET`. Without these, uploads return a clear "storage not configured" error.

### SMTP (optional)
Any provider (Brevo, Resend, Mailgun, Gmail app password). Without SMTP set, the server
logs OTPs / reset links to its console instead of emailing.

## 2. Backend on Render

**Option A — Blueprint (recommended):** the repo includes `render.yaml`.
In Render: **New → Blueprint**, pick this repo. It configures the service from `server/`
with `npm install && npm run build`, `npm start`, and health check `/api/v1/health`.
Then fill in the secret env vars (below) in the dashboard.

**Option B — manual Web Service:**
- Root Directory: `server`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Health Check Path: `/api/v1/health`

### Backend env vars

| Key | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas connection string |
| `JWT_ACCESS_SECRET` | long random string |
| `JWT_REFRESH_SECRET` | different long random string |
| `CLIENT_URL` | your Vercel URL, e.g. `https://eduswap.vercel.app` |
| `CORS_ORIGINS` | comma-separated allowlist incl. the Vercel URL |
| `CLOUDINARY_*` | from Cloudinary |
| `SMTP_*` | from your email provider (optional) |

`PORT` is provided by Render automatically — don't set it.

## 3. Frontend on Vercel

- **Import** the repo, set **Root Directory** to `client`.
- Framework preset: **Vite** (auto-detected). Build: `npm run build`, output: `dist`.
- The included `client/vercel.json` adds the SPA rewrite so client-side routes don't 404 on refresh.

### Frontend env var

| Key | Value |
| --- | --- |
| `VITE_API_URL` | your Render URL, e.g. `https://eduswap-api.onrender.com` (no trailing `/api/v1`) |

Redeploy after setting it (Vite inlines env at build time).

## 4. Wire the two together

1. Set the backend's `CLIENT_URL` and `CORS_ORIGINS` to the Vercel URL, redeploy.
2. Set the frontend's `VITE_API_URL` to the Render URL, redeploy.

Cross-site auth cookies require HTTPS on both (they are on Render + Vercel). The server
already sends the refresh cookie as `SameSite=None; Secure` in production and trusts the
proxy, so refresh + login persist across origins.

## 5. Post-deploy checklist

- Visit `https://<render-url>/api/v1/health` → should return `{ "success": true, ... }`.
- Sign up with a college email, verify the OTP, log in.
- Promote yourself to admin (run against production Atlas locally):
  ```bash
  cd server
  MONGODB_URI="<atlas-uri>" npm run seed:admin -- you@college.edu
  ```
- Confirm uploads work (Cloudinary configured) and chat connects (open two accounts).

## Troubleshooting

- **CORS / cookie errors:** ensure the exact Vercel origin (scheme + host, no trailing
  slash) is in `CORS_ORIGINS`, and `VITE_API_URL` points at the Render host.
- **First request slow:** Render's free tier sleeps when idle; the first hit wakes it.
- **Uploads fail:** Cloudinary env not set on Render.
- **OTP email never arrives:** SMTP not set — check the Render logs for the dev-logged code,
  or configure `SMTP_*`.
