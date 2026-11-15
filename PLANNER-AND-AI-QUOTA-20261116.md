# Daily planners, real schedules and AI quota handling

Implementation release: ebc01e1 (Render/Neon), with a follow-up removing the teacher sidebar fake generation counter and letter avatar.

## Actual cause of the reported file failures
The three failed student requests visible in the user session had status blocked and provider error AI_DAILY_LIMIT. Uploading and text parsing had succeeded. Do not describe this as a parsing failure or claim online AI quota is repaired by application code. Teacher and student AI use the same configured provider; their online generation remains subject to its quota.
Student chat now distinguishes the daily-limit error. For selected owned documents, daily/rate/provider/timeout failures fall back to deterministic source excerpts with file/page labels. The response explicitly says it is not AI-generated. It is not a translation, generated summary, independent model review or guarantee of complete document coverage. The same extraction path works when online AI is unconfigured. Model requests share a five-minute daily-limit cooldown in the worker, avoiding repeated upstream calls; no paid routing was enabled. Other teacher tools retain their explicit daily-limit message and approval controls.

## Interface
The student course/lesson context is a distinct expandable control with real course buttons and a lesson selector. Input focus is restrained and neutral. Sidebar branding was removed; no Nova/M logo is presented as conversation history. Current-session history remains labelled as nonpersistent. Teacher home now renders authorized courses and real planner records, replacing fixed lessons, statistics and schedule examples. The fixed student daily schedule and fabricated lesson-goal duration were removed. Existing database-backed student progress, latest content and academic schedule remain.

## Planner storage and visibility
/planner (student) and /?page=planner (teacher) use the new nova_planner table, migrated by the normal SQLite/PostgreSQL schema path. A private plan has owner, optional authorized course, title/details, start/end UTC, kind, priority, status and revision. Only its owner can read/edit it. Completed records are retained and can be restored to pending; stale revisions fail. Date range and text limits are validated. No student can publish a class event.
Teacher class scheduling writes to the existing course-scoped nova_class_events API. Enrolled students see those course times. Published exam deadlines also appear; already submitted student exams are omitted. Existing class times are not fabricated, changed or deleted by homepage rendering. Personal and course records are visually distinguished by labels, type colors and icons. The flame treatment is reserved for classes on the current day.
Homepage reminders show pending plans and real academic events. Reminders are inside the open app, not SMS/email/background push. The full page offers week selection, priorities, edit, completion/undo and a closeable guide. Student and teacher navigation include the planner.

## Evidence
57 automated tests passed; TypeScript and student/teacher/admin/API builds passed; component checks passed. Tests cover ownership, unauthorized writes, stale revisions, invalid times, enrolled class visibility, direct file extraction and provider daily-limit cooldown.
Local browser: created a personal plan, reloaded it, changed priority and marked complete. Confirmed file attachment produces correctly labelled source excerpts with Amber Otter and file/page attribution. Planner guide works; 390px layout has no document overflow. Course buttons show only real authorized courses.
Live PostgreSQL: student and teacher private plans persisted, were edited and completed. Verification-only records were left completed, so they do not create pending homepage reminders. No invented class was published to students. The live private-file extraction request passed in 997ms, independent of provider quota. A live student browser request also reached the correct excerpt fallback after the provider daily-limit error.
No credentials, real note contents or environment secrets are included in the report. The old Liara package was left untouched.

Evidence files: planner-tests.log, planner-build.log, planner-api-build.log, planner-components.log, planner-live.json, planner-ai-live-fixed.jpg and planner-student-mobile.jpg.
