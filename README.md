# ExamFlex App

Mobile-first web app for NEET & JEE exam preparation. Learners sign in, take
full mocks, sprint tests and chapter-wise tests, review their mistakes, and
track their progress. It is the learner-facing client of the ExamFlex platform.

## What you need for local development

| Requirement | Notes |
| --- | --- |
| Node.js **>= 20.9.0** | Enforced by `engines` in `package.json`. |
| npm | The repo uses `package-lock.json`. |
| **examflex-api running locally** | The app has no data of its own. Everything (auth, exams, attempts, analysis) comes from the API on port 3000. |
| MongoDB and Redis | Needed by the API, not by this app. See the API repo. |
| MSG91 widget credentials | Only for phone OTP sign-in and onboarding phone verification. |
| Google OAuth web client | Only for Google sign-in. Optional. |

Sibling repos are expected side by side:

```
ExamFlex/
  examflex-api/     NestJS API       (port 3000)
  examflex-admin/   Admin dashboard  (port 3001)
  examflex-app/     This app         (port 3002)
```

## Getting started

1. **Start the API** (see `examflex-api/README.md` for its own setup):

   ```bash
   cd ../examflex-api
   npm install
   npm run start:dev
   ```

2. **Configure this app.** Copy the example env file and fill it in:

   ```bash
   cd ../examflex-app
   cp .env.example .env.local
   ```

3. **Install and run:**

   ```bash
   npm install
   npm run dev
   ```

4. Open [http://localhost:3002](http://localhost:3002).

| Service | Port |
| --- | --- |
| examflex-api | 3000 |
| examflex-admin | 3001 |
| examflex-app | 3002 |

## Environment variables

All app variables are `NEXT_PUBLIC_*`, so they are **visible in the browser**.
Never put secrets here. Restart `npm run dev` after changing them.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | API **origin only**, e.g. `http://localhost:3000`. Do not append `/api/v1`. |
| `NEXT_PUBLIC_MSG91_WIDGET_ID` | For phone OTP | MSG91 OTP widget id. |
| `NEXT_PUBLIC_MSG91_TOKEN_AUTH` | For phone OTP | MSG91 widget public token. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | For Google sign-in | Web OAuth client id. Leave empty to keep phone OTP only. |
| `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` | For Google sign-in | Must exactly match Google Cloud Console and the API's `GOOGLE_REDIRECT_URIS`. Locally: `http://localhost:3002`. |
| `NEXT_PUBLIC_BRAND_NAME`, `NEXT_PUBLIC_LEGAL_NAME`, `NEXT_PUBLIC_LEGAL_ADDRESS`, `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_SUPPORT_PHONE`, `NEXT_PUBLIC_GRIEVANCE_OFFICER_NAME`, `NEXT_PUBLIC_LEGAL_JURISDICTION` | No | Brand and legal copy on the public pages. Defaults are in `.env.example` and `lib/brand.ts`. |

### What the API needs for this app to work

Set these on the **API** process (not here):

```bash
CORS_ORIGINS=http://localhost:3002
GOOGLE_REDIRECT_URIS=http://localhost:3002
```

The API also needs `MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`, `INSTANCE_ID`,
`MSG91_AUTH_KEY`, and (for Google) `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
See its `.env.example`.

## Stack

- Next.js 16 (App Router) + React 19, React Compiler enabled
- TypeScript, Tailwind CSS 4
- Turbopack for local dev
- Vitest + Testing Library (jsdom)
- `mathpix-markdown-it` for rendering maths in questions and explanations
- `lucide-react` icons

> This Next.js version has breaking changes from older releases. Check the
> bundled docs in `node_modules/next/dist/docs/` before relying on memory
> (see `AGENTS.md`).

## Scripts

```bash
npm run dev            # dev server on :3002 (Turbopack)
npm run build          # production build
npm start              # serve the production build on :3002
npm run lint           # ESLint
npm test               # Vitest, single run
npm run test:watch     # Vitest watch mode
npm run test:coverage  # with coverage (thresholds below)
npm run test:ci        # coverage with the default reporter, for CI
```

Coverage thresholds are **100%** (statements, branches, functions, lines) for
application source, so new code needs tests alongside it (`*.test.ts(x)` next
to the file). Test fixtures live in `test-utils/`.

## Project layout

| Path | Responsibility |
| --- | --- |
| `app/` | Routes and layouts: composition, metadata and routing only. |
| `components/` | UI, grouped by feature (`analysis`, `attempt`, `auth`, `mocks`, `study`, `today`, ...). |
| `hooks/` | Reusable client state and effects. |
| `lib/` | Pure logic. `lib/api/` holds one typed client per API area; `lib/auth/` holds session, redirect and MSG91 widget helpers. |
| `types/` | Shared contracts. |
| `middleware.ts` | Edge route guard based on the `authSession` cookie. |
| `docs/mocks/` | Architecture notes and API map for the mock-test feature. |
| `.cursor/rules/` | Project coding standards (architecture, TypeScript, testing, responsive UI, loading). |

## Routes

| Area | Routes |
| --- | --- |
| Public | `/` (landing), `/login`, `/help`, `/faqs`, `/contact`, `/terms`, `/privacy-policy`, `/user-policy`, `/delete-account` |
| Study (signed in) | `/today`, `/mocks`, `/mocks/exam/[id]` (`full-mocks`, `sprint-tests`, `chapter-wise`), `/analysis`, `/equation-book`, `/mistake-book`, `/profile` |
| Attempt (signed in) | `/mocks/attempt/[attemptId]`, `/mocks/attempt/[attemptId]/result` |

Signed-in routes redirect to `/login` without a session. `/login` redirects to
`/today` (the default post-login route) when a session exists.

## Authentication

- **Phone OTP** through the MSG91 widget in custom-UI mode. The browser asks
  MSG91 to send and check the code; the app sends the resulting access token to
  the API, which verifies it with MSG91 and reads the phone number from MSG91's
  reply, never from the client.
- **Google sign-in** through the OAuth redirect flow, returning to the landing
  page with a `code` query parameter.
- The access JWT is held **in memory**. Refresh uses the API's HttpOnly
  `examflex_rt` cookie.
- `authSession` (presence marker for middleware) and `profileComplete`
  (rendering hint only) are non-secret cookies. The API enforces access on every
  request.
- New learners must finish onboarding (name, verified mobile number, target
  exam) before reaching the study area.
- **Email verification** (not a sign-in method): learners without a real email
  add one on `/profile` by proving it with an emailed code from the same MSG91
  widget (email channel). The API reads the address from MSG91 and is the only
  way to set it; `PATCH /users/me` rejects a new email. Design:
  `examflex-api/docs/EMAIL_VERIFICATION.md`.

## Security headers

`next.config.ts` sets an enforcing Content-Security-Policy. It allowlists the
API origin (from `NEXT_PUBLIC_API_URL`), MSG91, hCaptcha and Google. If you add
a new third-party script, API host or embed, add it to the matching directive
or the browser will block it.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Every request fails with a CORS error | API `CORS_ORIGINS` does not include `http://localhost:3002`. |
| Requests hit `/api/v1/api/v1/...` | `NEXT_PUBLIC_API_URL` includes `/api/v1`. Use the origin only. |
| Google sign-in returns `redirect_uri_mismatch` | `NEXT_PUBLIC_GOOGLE_REDIRECT_URI`, Google Cloud Console and API `GOOGLE_REDIRECT_URIS` are not identical. |
| Phone OTP never sends or the widget does not load | Missing or wrong MSG91 widget id / token, or the MSG91 host is missing from the CSP. |
| Env change has no effect | Restart `npm run dev`. `NEXT_PUBLIC_*` values are inlined at build time. |
| Logged out after refresh on a non-localhost host | The refresh cookie needs a matching domain on the API. See its `.env.example`. |
