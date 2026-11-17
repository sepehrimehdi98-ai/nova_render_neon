# AI efficiency and quota handling — 2026-11-17

No billing settings, provider keys, UI design, role access or separate Liara package were changed.

## Changes

1. Pure greetings and thanks in tutor, teacher chat and ordinary builder consultation use fixed bilingual responses with providerCalls:0. File/source requests, web requests, selected blocks, explicit proposals and substantive questions still use the existing AI pipeline. Access checks run before this shortcut and again before saving its result. These replies are labelled deterministic-greeting, not model-reviewed or generated lesson content.
2. Multi-model worker replies can be reused only after existing response validation. Cache keys include the authenticated job user/course/lesson/task scope plus the entire instruction and input (including history, evidence, selected documents, draft and explicit preferences). Cache is worker-local RAM only, 2-minute TTL, at most 64 entries and 64KB per reply. Results are cloned to avoid mutation. Different users or changed context cannot reuse an entry. No semantic matching or cross-user response cache is introduced. Cache hits are validated again; source/role checks remain. Identical in-flight requests share one call. Student drafts enter cache only after successful execution checks and independent review; an eventual cache hit still executes the existing review path.
3. Quota cooldown state is shared by model routes using the same credential, while distinct credentials keep isolated state. Minute limits respect Retry-After (15-second default). Free-model daily limits suppress inference retries until the next UTC day. A server-only GET /api/v1/key counter check at most once per minute can clear the cooldown after a legitimate quota increase; it never logs or exposes the key/account response. Counter failures leave the circuit closed. These limits do not authorize quota bypass or automatic paid-model routing.
4. Ordinary response guidance asks for 60–120 useful words and 1–3 short points when appropriate. Explicit detail, user format/language, full lesson draft capacity, file context, code checks and independent review are preserved. Maximum output token limits remain unchanged to avoid truncating structured lesson drafts.

## Evidence and limits

Full npm test: 82 tests passed. Production npm run build passed. New tests cover zero-call fixed replies, scope/context isolation, expiry, cloning/eviction, coalescing, validated-only reuse, credential cooldowns and capacity-counter recovery. This proves those cases, not a percentage saving across all real usage. Ordinary conversation history changes mean many requests correctly miss the exact-context cache.

The current free provider daily cap still applies. More keys/accounts are not a guaranteed capacity increase; OpenRouter explicitly documents global capacity governance. Official reference: https://openrouter.ai/docs/api_reference/limits . This optimization cannot restore arbitrary generation while the provider rejects it. Existing local extraction modes remain available for supported files.

Earlier live QA reached AI_DAILY_LIMIT; avoid spending more generations solely to benchmark while quota is exhausted. Live rollout verification is limited to API health and fixed zero-call greetings in student, teacher and builder flows. Do not claim a new live speed/accuracy benchmark for substantive AI responses until fresh quota is available. Prior teacher-file/draft/preview checks and their limitations remain in TEACHER-AI-VALIDATION-20261117.md.
