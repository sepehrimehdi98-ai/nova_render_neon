# Nova AI model routing — 2026-11-17

Server-only OpenRouter configuration:

- OPENROUTER_CHAT_API_KEY: Lightning account key.
- OPENROUTER_CHAT_MODEL: nvidia/nemotron-3.5-lightning:free.
- OPENROUTER_CONTENT_API_KEY: Super VL account key.
- OPENROUTER_CONTENT_MODEL: nvidia/nemotron-3.5-super-vl:free.
- OPENROUTER_API_KEY: retain the existing Ultra account key for optional fallback.
- OPENROUTER_FALLBACK_MODEL: nvidia/nemotron-3-ultra-550b-a55b:free (default).
- OPENROUTER_FREE_ONLY: true. OPENROUTER_FREE_FALLBACK=off disables fallback.

Chat handles ordinary student/teacher conversation and builder consultation. Content handles selected-document requests, source review, independent student-answer review, authoring, and requested builder operations/summary. The router forwards the original validated context and instructions. Role checks, history, selected excerpts, citations, retrieval, hashed local embeddings or configured embedding model, web opt-in and teacher approval remain in their existing layers. Local-only extraction is unchanged.

New keys are optional for compatibility. Without either new key the old single-provider behavior is retained. With new keys, missing route credentials fall back to the existing key, then another configured new key; configure both for separate account usage. Each model always uses the server-selected credential, never a browser-supplied key. Auth/credit/access/daily-quota errors do not trigger account fallback. Temporary provider failures, model unavailability and minute/provider rate limits can try Ultra once using the old key. No automatic generic free-router call follows this fallback. Cooldowns are isolated per provider-client route. No promise of unlimited quota or lower latency is made.

Short routed calls have a 20-second primary deadline, longer drafts 45 seconds; Ultra uses the same bounds. Existing queue and retry/validation limits remain. Nemotron 3.5 calls disable optional reasoning for latency; independent review remains separate. Routing metadata contains model IDs, never keys. No keys were put in source or documentation.

Files: current accepted formats remain textual PDF, DOCX, TXT and Markdown with existing size limits. Super VL receives extracted text through the existing RAG pipeline. This change does not add OCR, raw-image/video sending, or claim full-document coverage from selected excerpts. Free NVIDIA endpoint data policies apply; do not upload confidential/personal material without appropriate provider/privacy controls.

Validation: npm test passed 72 tests including 3 new routing tests; npm run build passed. Routing tests stub upstream inference and verify matching model/key pairs, context forwarding, free-only guard, isolated quota cooldowns, one Ultra fallback and no quota/auth fallback. Live inference is a separate validation step and must be reported with its actual outcome.

Deployment: save private values in nova-api environment only; deploy the matching source commit. Never place keys on portal services or in public-prefixed frontend variables. Preserve the old OPENROUTER_API_KEY for Ultra backup. Rollback: unset the two new route keys and restore OPENROUTER_CHAT_MODEL to Ultra, then redeploy. The separate Liara package was not overwritten.

## Live validation follow-up

Published commits: ccc09e640257a8aae3347ccf6299d07e6b22adde and 6234a217d287b33e54a6381dc13d289b93e51cdb. Both new keys were saved privately in Render using Save only before publication. Live Super VL responses confirm delivery of new routing. Structured JSON output was enforced after an initial admin response-format failure; the admin recheck passed.

Passed live: existing and newly uploaded teacher text-file questions with correct facts and document citations; summary proposal; code and practical exercise proposals including starter/sampleAnswer/feedback, without publishing; admin lesson consultation with model review; student-owned file upload and fact Q&A with citations and independent review. Student file processing took about 3.2 seconds in the worker (11.2 seconds full API test including requests/polling). Teacher summary worker processing was about 1.8 seconds (6.1 seconds full API test). These are individual observations, not latency guarantees.

Blocked: Lightning chat calls returned AI_AUTHENTICATION_FAILED. OPENROUTER_CHAT_API_KEY must be corrected privately, then deployed and retested. No auth-error fallback hid that misconfiguration. A teacher reference-link check did not return the expected Python-documentation citation; this is not recorded as a passed source-link test. Existing SSRF protections and source validation remain, but further diagnosis is required. Never claim every live AI feature passed from the local mocked tests.

## Corrected key deployment and retest

Render deployment dep-dbu1v2kipgvc73afp5h0 (6234a217) succeeded after saving the corrected chat key and restoring the accidentally renamed API_KEYOPENROUTER_ field to OPENROUTER_API_KEY. Live teacher chat served Lightning directly, and Super VL file reading, lesson summary and admin consultation passed. One existing student-context test was withheld by review rather than failing authentication; a fresh student chat then passed on Lightning with independent model review. Both primary model credentials now work. Full API observations: teacher chat ~4.1 seconds, file reading ~10.2 seconds, builder summary ~10.4 seconds, admin consultation ~10.3 seconds, fresh student chat ~7.6 seconds. These include requests/polling and are not provider-only timings or guarantees. The earlier link-citation check remains a separate unresolved validation item.

## Current routing after teacher QA

Persian answers now select Super VL directly because Lightning produced visibly garbled/mixed Persian in live comparisons. Explicit English ordinary requests retain Lightning. This applies consistently to main chat, builder consultation and tutoring without changing prompts/history/RAG permissions or adding a routing model call. File analysis, authoring and independent review remain on Super VL. See TEACHER-AI-VALIDATION-20261117.md for the consultation-only guard, safe reference redirects and live coverage.
