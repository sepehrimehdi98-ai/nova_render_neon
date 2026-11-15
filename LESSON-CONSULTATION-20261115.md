# Lesson consultation and published-style preview

The current Render/Neon edition separates ordinary teacher consultation from reviewable lesson operations. The existing Persian layout, role navigation, student notes and media URL restrictions remain in place. The separate older Liara package was not overwritten.

## Teacher workflow

- Ask an ordinary question in Persian or English without choosing a block or supplying a source. A conversational answer can contain zero proposed operations.
- Choose one or more block types, or use a block's AI edit control, to request a change. Review the proposed content before accepting it. Acceptance changes the current draft; saving and publication remain separate actions.
- Files are attached through the existing + control; public HTTPS links can also appear directly in a message. Selected documents are checked for ownership/course access. Relevant pages are ranked across the selected documents rather than taking only the beginning of each file. Claimed source IDs must match the actual extracted/fetched evidence.
- Use “پیشنهاد جمع‌بندی پایان درس” after discussing the lesson. The AI proposes an add/update operation for a student-facing summary. After teacher approval, the shared lesson renderer places summary content at the end of the content blocks in a purple section. This is approved lesson content, not an unreviewed chatbot answer inserted automatically.

## Conversation retention

Each draft has a conversation ID. After the first lesson save, the teacher's queued/completed builder jobs are bound to that lesson. Reopening the saved lesson retrieves its own conversation, filtered by teacher, course and lesson. Preview navigation does not create another conversation. There is no builder conversation-list sidebar. The latest 100 requests are displayed; the model receives a bounded recent context of eight requests. Failed questions remain in context with an explicit missing-response marker.

Unsent message text and accepted/dismissed proposal markers are retained in session storage for the current account/course/conversation. These conveniences depend on browser storage and are not cross-device storage. Sent requests are stored in the database. A never-saved new lesson is not a durable lesson draft. Older mixed course-level jobs without a lesson/conversation association cannot reliably be attributed to a particular lesson and are not silently merged into it.

The main teacher assistant also remembers the selected conversation in this browser tab. Changing sources still works per message. Expired/revoked access is checked again after generation. No model training occurs from conversation retention.

## Accuracy and reliability

Ordinary answers do not require citations. Explicit questions about selected files require evidence citations when evidence exists. Teacher conversation/builder generation gets at most one repair for invalid response shape or citations; malformed output is never applied. Source-ID validation is not an independent factual proof. Code proposals are labeled unexecuted, and teacher approval remains required. Student independent review and execution safeguards remain unchanged.

Nemotron remains the configured primary model. For a temporary failure or timeout on a free primary, one OpenRouter `openrouter/free` request is allowed with zero prompt/completion price ceilings. A failed primary has a two-minute in-worker cooldown. Normal primary requests have a 20-second initial timeout; larger proposals get 45 seconds. Fallback has a bounded 45/60-second timeout. `OPENROUTER_FREE_FALLBACK=off` disables this behavior. No paid route, embedding service or web-search subscription is enabled. The response records actual model/fallback routing; the teacher UI identifies fallback responses. Free services can still be busy or rate-limited. Daily-limit errors are not retried through another route.

Graceful worker shutdown aborts in-flight provider calls and requeues the owned request before releasing its lease. An abrupt process kill still relies on lease expiry. Rate limits, provider timeouts and invalid replies receive readable Persian messages; drafts and source references are not silently discarded.

OpenRouter references: [free router](https://openrouter.ai/openrouter/free), [fallback routing](https://openrouter.ai/docs/guides/routing/model-fallbacks).

## Preview and completion

Teacher/admin preview and student lesson use the same LessonExperience component. The teacher preview now receives the actual completion settings and current edited quiz values. Code execution, practice feedback and quiz checking are interactive simulations; they do not write student progress. A native expandable “پایان جلسه و شرایط ادامه” section groups manual video acknowledgement, practice/quiz navigation and completion. Actual student completion, passing scores, private grading requirements and next-lesson permissions remain server-enforced. A manual video acknowledgement is self-report, not proof of playback duration.

Local desktop and phone-width browser checks covered the builder, draft-message retention across preview navigation, Python execution returning `Nova`, sample practice feedback, a 100/100 preview quiz and session-completion simulation. Screenshots are included in the handoff evidence. Local regression coverage is 52 tests, plus component-render checks and portal/API production builds.

Live core release `50c26ab` was checked on 2026-11-15. Across recorded runs, all eight scenarios produced passing examples: ordinary Persian builder consultation, English follow-up memory, selected-file Q&A, public-link citation, a reviewable summary proposal, ordinary main-teacher chat, switching to a DOCX source, and main-teacher link Q&A. The latest run passed six of eight; the other two received provider rate limits. Do not describe that run as completely passing. Warm follow-up/file/link responses measured about 7–12 seconds in several cases, a summary proposal about 14 seconds, and the first primary-timeout/fallback request about 27 seconds. These measurements are samples, not latency guarantees.

TXT and DOCX parsing succeeded; unsupported files and an oversized upload were rejected. The latter returned HTTP 413 at the live request boundary. Initial Nemotron requests timed out; the first fallback run also encountered rate limits and an invalid source response. Those failures were retained as evidence rather than reported as passing. The current code adds one validated repair, never an unvalidated replacement answer. Existing lesson/password/note data was not edited by those scripted checks.

Final live UI/storage verification on release `f582d9a`: a new, clearly labeled demonstration draft, “نمونه مشاوره و جمع‌بندی — ۱۵ نوامبر”, was created through the teacher interface. Its actual AI summary was explicitly approved, saved, reopened and previewed. PostgreSQL returned one stored summary at draft revision 1; the administrator read the identical draft; the student's attempt returned 404. Two private builder requests were restored after reopening. This demonstration was not published and no pre-existing lesson was edited. Evidence: builder-ai-ui-verification.json and builder-summary-live.jpg in the handoff.

The additional current student-AI live retests did not pass: one returned AI_PROVIDER_UNAVAILABLE and another AI_RATE_LIMITED. Independent student review was preserved, and no unvalidated answer was presented as successful. Student AI availability therefore remains externally blocked/intermittent and is not certified by this release. A brief HTTP 502 during the Render redeploy cleared; all three portal proxy health endpoints subsequently returned 200 with PostgreSQL/AI configuration detected. Configured does not mean a provider request is guaranteed to succeed.
