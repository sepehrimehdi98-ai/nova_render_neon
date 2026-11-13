# Lesson builder validation — 2026-11-11

Implemented: per-block deletion, heading/list/quote/divider blocks, selected text font sizes, persisted lesson metadata, saved references, TXT/Markdown source upload and source approval, focused-block AI consultation, existing exam selection, chapter/block ordering with arrow alternatives. Student rendering preserves text formatting.

Validation: backend npm test: 21 passed, 0 failed. Additional demo/portal tests: 6 passed, 0 failed. build:portals: TypeScript and student/teacher/admin production builds passed. OpenRouter follow-up: 4 tests passed.

Live checks: all three accounts logged in successfully; builder font marks and exam relation persisted; cross-course exam assignment rejected; chapter order saved and restored; student draft access denied; invalid AI focus block rejected; official Python reference fetched and stored. Browser verified add/delete controls, source selector, preview text at 24px. Native drag gestures and browser file upload have not been fully acceptance-tested.

Limits: file extraction supports TXT/Markdown only; original binary files are not retained. Web fetching is restricted to docs.python.org, peps.python.org and developer.mozilla.org. Sources need a successful review and teacher approval before retrieval. Current free retrieval uses local hashed keyword vectors, not a semantic embedding model. AI calls are real OpenRouter calls, not canned replies. A live model response failed strict JSON validation; provider reasoning settings were changed, but another live source-review retry still returned INVALID_AI_RESPONSE. Focused consultation was queued again; successful completion is not confirmed. Do not treat AI verification as passed until an actual completed job is recorded.

GitHub: https://github.com/sepehrimehdi98-ai/nova_render_neon
Teacher: https://nova-teacher.onrender.com
Student: https://nova-student.onrender.com
Admin: https://nova-admin-veea.onrender.com

The separate Liara package was not modified.
