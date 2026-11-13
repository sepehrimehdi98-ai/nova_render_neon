# نووا — Learning workspace and persistent header

Local implementation, 12 November 2026. Not pushed to GitHub or deployed. The older Liara package is unchanged.

## Changes
- Shared sticky RTL header across all authenticated teacher, student and admin pages, with direct role-specific links, active page, real account name and logout. Nested lesson pages keep course navigation active. Teacher authentication loading no longer flashes the login form.
- Course → chapter → lesson catalog matching the supplied blue/white template, chapter descriptions, published-only student contents, linked exams, teacher editing and drag/drop plus keyboard alternatives.
- Teacher exam builder: questions, correct answer, code, HTTPS image, weighted points, order, preview, draft and publication.
- Student exam: introduction, server deadline, question map, bookmarks, revision-based autosave, resume, review and final submission.
- Personal performance reuses individual charts, own grades/results/activity only. Activity is not proof of attendance.
- Existing shared teacher/admin ticket UI and private document assistant remain integrated. Compact lesson assistant scrolls its own conversation and deduplicates citations.
- Additive database tables for chapter details, exam settings and attempt revisions/bookmarks. Exam content locks after attempts; staff may separately publish results.

## Local verification
npm run build: PASS
npm run build:portals: PASS (student, teacher, admin)
npm test: 31 passed, zero failures (25 backend + 3 demo + 3 portal).
Browser: teacher chapter/lesson reorder persisted; teacher exam edited, previewed, saved and published. Student exam resumed saved answers and bookmark, answered all 4, reviewed and submitted; 20/20 persisted into personal performance. Shared header remained at viewport top 0 during scroll; teacher direct course/ticket/exam links and student exam/performance links worked; admin ticket page rendered under the same header.
Screenshots are real local browser captures. Mobile styles are included; a reliable mobile viewport capture was not obtained in this pass.
Online generation is not verified: local demo has no online AI key. Document extraction is labeled as local retrieval, not model training. Live PostgreSQL and production deployment were not tested in this pass.

## Run
Node.js >=24. From project:
npm run setup
npm run build:portals
npm run start:all

Student: http://127.0.0.1:3101/
Teacher: http://127.0.0.1:3102/
Admin: http://127.0.0.1:3103/
Local fresh demo accounts: student, teacher, admin / NovaDemo-2026!
These credentials are local only. Configure deployment secrets privately using the included environment examples and deployment guides.
The archive excludes local databases, uploads, installed modules, generated builds and secret env files. Current browser fixtures remain on this computer; seed scripts are in demo for reproducibility, with local-only guards.

## Main files
frontend/design/PlatformShell.tsx and platform-header.css — common header.
frontend/design/CourseCatalog.tsx and learning-design.css — catalog/template styles.
frontend/src/live/Exams.tsx — exam builder and student runner.
frontend/design/TeacherProgress.tsx — staff and personal performance.
backend/lib/platform/course-catalog.js — catalog/chapters/exam placement.
backend/lib/platform/demo-features.js — weighted grading, attempts and result visibility.
backend/lib/platform/teacher-workspace.js — own performance and private documents.
backend/test/learning-workspace.test.js — authorization, deadline, grading, autosave and isolation.
