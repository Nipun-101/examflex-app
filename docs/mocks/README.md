# Mocks section

ExamFlex student mock-test surface: browse exams → exam hub → start/resume → attempt → results.

Ported behavior from ezprep-app (`/dashboard` … `/dashboard/attempt/...`) against the shared examflex-api. Topic-wise papers are labeled **Chapter Wise**.

## Docs in this folder

| File | Purpose |
| --- | --- |
| [architecture.md](./architecture.md) | Routes, layouts, modules |
| [api-map.md](./api-map.md) | HTTP contracts used by the app |
| [parity-checklist.md](./parity-checklist.md) | Feature parity vs ezprep |
| [PHASES.md](./PHASES.md) | Phased delivery checklist |

## Route summary

- `/mocks` — category-grouped exam listing
- `/mocks/exam/[id]` — overview
- `/mocks/exam/[id]/chapter-wise` — chapter-wise papers
- `/mocks/exam/[id]/full-mocks` — full mocks
- `/mocks/exam/[id]/rapid-rounds` — Rapid Rounds (UI name for backend sprint tests; cosmetic rename only)
- `/mocks/attempt/[attemptId]` — full-screen runner (no StudyNav)
- `/mocks/attempt/[attemptId]/result` — results

## Status

All phases in [PHASES.md](./PHASES.md) are complete for v1. See [parity-checklist.md](./parity-checklist.md) for shipped behavior.
