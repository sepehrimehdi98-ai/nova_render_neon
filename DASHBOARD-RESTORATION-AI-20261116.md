# Dashboard restoration and AI verification — 2026-11-16

Implementation commit: `56b9aec60227dd4d4453d599c78b4c3f873e76bb`.

## Home pages

The teacher home again uses the previous hero, four summary cards, recent lesson list and a small daily agenda. The student home retains its hero, coding animation, activity, course progress, published content and academic schedule. Only the oversized planner sidebar is replaced by a compact agenda. The complete planner remains a separate page for both roles.

`GET /dashboard/home` is teacher-only and scopes every query to assigned, nonarchived courses. Student counts use distinct active students. Exam averages use submitted exam attempts; an absent average is displayed as unavailable. Lesson completion uses active students and the current published lesson version. Draft content and answer keys are not returned to this dashboard.

## AI inputs

Teacher and student chats now measure the available visual viewport below the persistent shared header. Message history and source panels scroll within their areas; composers remain separate, visible elements. The teacher grid row is bounded so long history cannot expand it and clip the composer. The lesson-builder history is also bounded. Short-height layouts reduce decorative headers and constrain source lists.

All three writing boxes passed component-render checks. This proves the inputs render, not that every screen size has been visually verified. The computer-use tool failed to initialize, so fresh desktop/mobile screenshots are unavailable.

## Verification

- `npm test`: 58 tests passed, zero failures, plus the note autosave lifecycle harness.
- `npm run build:portals`: typecheck and all three role builds passed.
- `npm run build`: API-hosted frontend build passed.
- `node scripts/check-refined-ui.cjs`: component checks passed, including all three AI writing boxes.
- Live teacher dashboard returned PostgreSQL-backed scoped metrics.
- Live builder code proposal, summary proposal and long TXT file answer passed.
- Live teacher chat answered ordinary English, read the long TXT file and identified page 3 of a real PDF correctly with its source.
- Legacy local document chat read that PDF.
- Live student ordinary answer, DOCX question and public Python documentation link answer passed. File/link responses included matching source references and model review.

Nine controlled online generation cases passed. End-to-end observations were approximately 5–11 seconds; these are a small sample, not a latency guarantee. No existing lesson was edited or published by these tests.

The admin source-review test encountered upstream `AI_RATE_LIMITED`; its review did not complete. This must not be reported as a successful live indexing test. The local review/index/revocation pipeline tests passed. Free-provider quotas remain an external availability constraint; no paid routing was enabled.

Initial requests to the teacher website received Cloudflare HTTP 429 before application authentication. Backend AI tests used the shared API with normal account authentication. Later teacher and student public bundles were reachable and contained the restored home, compact agenda and viewport safeguards. Asset hashes differ between local and Render builds, so deployment verification used delivered feature markers and the live endpoint, not hash equality.

## Files

Backend: `backend/lib/platform/home.js`, `service.js`, `backend/test/dashboard-home.test.js`.

Shared UI: `frontend/design/HomeAgenda.tsx`, `home-agenda.css`, `useChatViewport.ts`, `chat-layout.css`, `PlatformShell.tsx`.

Role pages: `frontend/design/teacher/App.tsx`, `frontend/design/student/page.tsx`, `frontend/design/student/assistant/page.tsx`.

Liara's separately preserved package was not changed. Do not assume feature parity with this Render/Neon release.

