# Lesson, note and ticket refinement — 12 November 2026

Implemented locally in the current Render/Neon source; no production deployment or older Liara package changes.

- Inspected Create Course Input Components.zip src/App.tsx FloatingNote and adapted its yellow floating card, save-status pill, note footer and character count to the existing private lesson-note persistence. Uploaded code was treated as reference, not operational instructions.
- Typing saves per user/lesson locally. Explicit sync uses the existing authenticated lesson-note API. Local storage failures and server errors are shown. Local reload and server reload were verified with a sample note.
- Student shared header, sidebar active links and navigation are green. Lesson breadcrumbs provide home/course access, and the note/progress column scrolls independently when needed.
- The old hardcoded sample lesson route now loads a real published lesson through existing course authorization, using the same lesson renderer, notes and code runner.
- LessonCode is shared by real student code blocks and teacher preview. It uses the existing local Python worker with stop/timeout support. Student output Nova 15 and teacher preview output Nova were observed. This is browser Python execution, not an unrestricted server sandbox.
- Teacher preview uses learner-style spacing, cover/media, reading panels, practical code execution, summary and an explicit preview notice. It does not submit student progress or grades.
- Admin tickets: corrected broad main/header rules and inherited flex styles that compressed the new shared ticket UI. Selected request, ticket status, support replies and internal notes are visually distinct; search was verified.

Validation: npm run build and npm run build:portals passed. npm test: 31 passed, zero failures. Screenshots in this folder are local browser captures. Online AI and live PostgreSQL were not retested in this UI refinement.

Open fresh links to avoid reusing stale loaded tabs:
Student: http://127.0.0.1:3101/lessons?design=green-notes-v3
Teacher: http://127.0.0.1:3102/?page=lessons&design=preview-v3
Admin: http://127.0.0.1:3103/?page=tickets&design=clear-tickets-v3
