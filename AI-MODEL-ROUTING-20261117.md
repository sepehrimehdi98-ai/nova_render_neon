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
