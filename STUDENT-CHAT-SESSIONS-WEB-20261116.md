# Student chat sessions, public web references and Python latency

## Saved conversations

Student AI has separate database-backed conversations per account and course. New conversation creates an independent thread; selecting a saved thread restores its questions, answers and pending/failed requests. Recent model context is limited to four completed online turns from that thread, with bounded text lengths. Threads do not share model context. Uploaded file metadata is restored with its message, while actual file ownership and current lesson access are checked again. Private histories are excluded from admin metadata reports.

New tables: `nova_student_threads`, `nova_student_turns`, created with additive, idempotent migrations. No existing messages or lessons are overwritten. Limits: 100 threads per account/course, 200 turns per thread, existing AI rate limits plus local-message limits. There is no chat deletion or rename interface in this release; initial titles derive from the first question.

Routes: GET/POST `/courses/:courseId/student-chats`, GET `/courses/:courseId/student-chats/:threadId`, POST `.../:threadId/local`. Online messages use the existing `/courses/:courseId/ai/jobs` with `threadId`. Sessions survive refresh/sign-out/server restart. The browser keeps only the selected thread ID in account/course-scoped session storage. Local mode saves explicitly labelled direct excerpts, not generated AI answers.

## Public-reference search

The opt-in student input checkbox searches a bounded public source set: Python documentation and Wikipedia in Persian/English. It is not a general commercial search engine or a guarantee of current news coverage. It retrieves actual text and URLs, passes them as untrusted evidence, and requires a relevant web citation for a web-grounded answer. Unavailable/empty retrieval is disclosed. File contents are not sent as search queries; the user's question is used. Document retrieval keeps DNS/IP/redirect protections. API requests have time/size limits; successful public query results are cached for five minutes with a 60-entry bound.

Default: `AI_WEB_MODE=public`, `AI_WEB_ENABLED=true`. `AI_WEB_ENABLED=false` disables the feature. The UI follows `/capabilities`. Existing paid OpenRouter search is only available with `AI_WEB_MODE=openrouter`, web enabled, and explicit `OPENROUTER_FREE_ONLY=false`. This release does not enable paid model routing or paid search. Render Blueprint and example configuration include public mode. Existing manually managed Render environment overrides may need updating if they explicitly disable web access.

Reference APIs: [MediaWiki search](https://www.mediawiki.org/wiki/API:Search), [OpenRouter web search](https://openrouter.ai/tool/web-search/).

## Response and execution optimizations

Model requests carry smaller recent history. Independent review remains enabled but receives cited evidence and lesson assessment context rather than duplicate full conversation/source bundles. The browser polls only a pending job rather than downloading a whole saved conversation repeatedly. Search sources are fetched concurrently and cached; normal chat does not trigger web search.

Each code box can warm Python on pointer/focus interaction and reuse its own worker for repeated runs. Every run gets a new Python globals dictionary; stdout, stderr and input are reset. Workers expire after 60 idle seconds, terminate on Stop/unmount/timeouts, and preserve the existing 24,000-character output cap and 45-second execution limit. Runtime load failures can be retried. Initial download/startup still depends on device/network speed; a fresh Python namespace does not claim a completely new Python process or module registry.

Lesson notes now show neutral focus around the note surface instead of a green textarea box. Autosave, local drafts, conflict handling and exports are unchanged.

## Verification

61 automated tests plus the autosave lifecycle harness pass. New tests cover thread persistence after database restart, context separation, role/account denial, and free reference retrieval/cache behavior. All portal/main builds and component checks pass. A real Python execution check loaded the runtime once, verified fresh variables and input/output reset, and observed roughly 1–2 seconds warm-up followed by 1–4 ms small examples in local Node. Those are not browser performance guarantees. Local public search retrieved real Python/Wikipedia excerpts. See the handoff evidence for live results and provider limitations. Browser screenshots and actual mobile keyboard interaction remain unverified because browser automation is unavailable.
