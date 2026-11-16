# ExamFlex App

Mobile-first web app for NEET & JEE exam preparation (Next.js + React).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3002](http://localhost:3002).

| Service        | Port |
| -------------- | ---- |
| examflex-api   | 3000 |
| examflex-admin | 3001 |
| examflex-app   | 3002 |

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript + Tailwind CSS 4
- React Compiler enabled
- Turbopack for local dev
- Vitest + Testing Library (mirrors examflex-admin)

## Scripts

```bash
npm run lint
npm test
npm run test:watch
npm run test:coverage
```

Coverage thresholds are 100% for application source. Cursor rules live in `.cursor/rules/`.

## Auth (local)

Copy `.env.example` to `.env.local` and fill MSG91 / Google public values.

The API must allow this app origin and Google redirect:

```bash
# examflex-api .env
CORS_ORIGINS=http://localhost:3002
GOOGLE_REDIRECT_URIS=http://localhost:3002
```

Post-login default route is `/today`. Access JWT stays in memory; refresh uses the API HttpOnly `examflex_rt` cookie.
