# Mocks API map

Base: `/api/v1`. Student lists/attempts need JWT via `apiFetch`.

## Browse

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/exams/by-category` | Public |
| GET | `/exams/:id` | Public |
| GET | `/subjects/exam/:examId` | Public |

## Papers

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/mock-tests/exam/:examId` | Chapter-wise (`TOPIC_WISE`) |
| GET | `/full-mock-tests?examId=` | Full mocks |
| GET | `/sprint-tests?examId=` | Sprint (shown in UI as "Rapid Rounds" — cosmetic rename, API unchanged) |

List items include `userAttemptAction` (`START` \| `RESUME` \| `RETAKE`), `access`, optional `resumeAttemptId`.

## Attempts

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/mock-test-attempts/start` | `{ mockTestId }` — entitlement gate |
| GET | `/mock-test-attempts/:id` | Hydrate / results (does not unpause) |
| GET | `/mock-test-attempts/:id/resume` | Unpauses if PAUSED |
| PATCH | `/mock-test-attempts/:id/answer` | `{ selectedOptionId }` nullable clears |
| POST | `/mock-test-attempts/:id/pause` | keepalive on unload |
| POST | `/mock-test-attempts/:id/submit` | Final submit |
| POST | `/mock-test-attempts/:id/sessions/complete` | Session-wise sections |

## Access / catalog

| Method | Path |
| --- | --- |
| GET | `/me/entitlements` |
| GET | `/catalog/products/for-exam/:examId` |
| GET | `/catalog/products/for-mock-test/:mockTestId` |

API repo docs: `MOCK-TEST-ATTEMPTS.md`, `PAUSE_RESUME_API.md`, `QUICK_REFERENCE.md`.
