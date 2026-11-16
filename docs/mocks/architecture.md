# Mocks architecture

## Layout split

```
app/(app)/layout.tsx              → Suspense + AuthenticatedAppArea (session only)
app/(app)/(study)/layout.tsx      → StudyShell (nav + StudyLoadingProvider)
app/(app)/(study)/mocks/...       → listing + exam hub
app/(app)/(attempt)/layout.tsx    → AttemptShell (loading provider, no nav)
app/(app)/(attempt)/mocks/attempt/[attemptId]/...
```

Attempt routes must not show StudyNav. Listing/hub keep the study chrome.

## Modules

| Area | Location |
| --- | --- |
| API clients | `lib/api/exams.ts`, `mock-tests.ts`, `full-mock-tests.ts`, `sprint-tests.ts`, `attempts.ts`, `catalog.ts`, `entitlements.ts` |
| Types | `types/exam.ts`, `mock-test.ts`, `attempt.ts`, `access.ts` |
| Pure helpers | `lib/mocks/` (routes, sessions, storage, paper-access) |
| Math | `lib/math/` + dynamic `mathpix-markdown-it` |
| UI listing/hub | `components/mocks/` |
| UI attempt | `components/attempt/` |
| Hooks | `hooks/use-launch-attempt.ts`, exam page context |

## Patterns

- Thin App Router pages; client shells own data/UX
- Layout-level `GET /exams/:id` shared via React context
- `apiFetch` + boundary parsers (`ApiResult<T>`)
- Declarative `StudyLoadingOverlay` for initial blocking loads; `run()` for in-page actions
- Server-owned attempt clock; keepalive pause on unload
- Paper-type exit routing after pause/leave
