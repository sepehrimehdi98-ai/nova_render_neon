# Teacher and lesson-builder AI validation — 2026-11-17

The live teacher assistant passed Persian conversation, English follow-up with context, selected-file fact extraction and citations, direct public-reference Q&A, and opt-in public search. The lesson builder passed code/practical-exercise proposals, four-option question generation, targeted block updates, precise summary proposals and selected-document consultation. Stored teacher messages and builder jobs were read back through the API. These checks use synthetic QA content, not private learner records.

A live ordinary consultation unexpectedly returned block operations. Fixed by an explicit consultation-only system instruction and a server-side validation gate. Explicit proposal/summary/target/block-type requests authorize operations; normal conversation does not. Invalid operations get one bounded repair attempt; teacher approval is still required to alter the draft. No published lesson was modified.

Some Python documentation URLs now redirect to new paths. Reference fetching now permits at most two HTTPS redirects on the same host, with fresh DNS and public-address checks at every hop. Cross-host redirects, HTTP downgrade, credentials, private destinations and redirect loops remain blocked. Fragment anchors prioritize the requested section before excerpt limits. No arbitrary redirect following or browser credentials were introduced.

Local validation: full npm test passed 74 tests, including consultation gating and redirect/DNS-rebinding/anchor cases; npm run build passed. Live post-deployment validation is recorded separately in handoff evidence. Current accepted file formats and limits remain unchanged (textual PDF, DOCX, TXT, MD); this change does not add OCR. Model review/citations are safeguards, not guarantees of factual correctness.

## Persian quality follow-up

Browser testing exposed mixed-language/garbled Persian in Lightning even when explicitly asked to avoid English. In a same-question comparison, Super VL gave a clearer relevant Persian explanation. Multi-model routing now selects Super VL directly for Persian answers using the existing response-language detector, including the lesson builder and student tutor. Explicit English requests retain Lightning for ordinary chat. Source-heavy tasks, authoring and independent review still use Super VL. The shared prompt explicitly asks for fluent Persian without random English fragments. This is a quality-based routing choice from observed samples, not a guarantee of perfect answers. No extra model call is introduced for routing. Full regression suite now contains 75 tests.

## Language sanity safeguard

A later Persian builder sample from Super VL also contained unrelated foreign-language fragments. It was recorded as a failed quality check, not called a pass. Added shared language validation to teacher/builder bounded response repair and student generation review: unrelated Chinese/Japanese/Korean script in Persian prose is rejected unless specifically requested; explicit no-English requests reject Latin prose while preserving fenced/inline code and code-block content. One existing repair attempt is used, not an unbounded retry or extra call for valid answers. This check cannot prove grammar or factual correctness. Final regression suite contains 76 tests.

## Bounded quality repair fallback

Repeated malformed Persian from Super VL was withheld rather than silently accepted. Teacher/builder validation now uses the existing second generation attempt on the configured Ultra fallback account when available. It receives the same role-scoped history/evidence and must pass the same language/schema/citation/operation validators. No additional generation attempt was added; auth/daily-credit errors still do not trigger account fallback. Without an Ultra key or with fallback disabled, the existing same-route repair remains. This applies to the teacher and builder JSON-validation helper; student review behavior remains independently checked. Routing metadata identifies response_validation fallback without exposing credentials. Final local suite: 77 tests passed.
