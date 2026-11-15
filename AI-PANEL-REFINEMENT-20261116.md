# AI and panel refinement — 16 November 2026

Render/Neon implementation commit: `fd8cf1d8ef1ed17da23c0721d5660f2dc06d2685`.

## What changed

- Ordinary lesson consultation sends ranked, bounded block context rather than every full block. Explicit editing, summaries and approval keep the complete lesson snapshot. Polling omits unused large snapshots; it does not remove stored data or weaken stale-proposal checks.
- Substantive AI answers are prompted to give developed explanations with useful headings, steps and examples. The usual 120–220-word guidance adapts to the question and explicit length requests; greetings stay short.
- Shared teacher chat rendering supports safe headings, lists, emphasis and code. It does not render raw HTML. Composer styling is neutral, with no blue typing box or permanent caution footer. The elapsed waiting indicator reflects the real job state. Users can draft their next message while a response is pending.
- The optional lesson-builder tour covers ten sections: library, block editing, media, consultation, lesson settings, advanced details, scheduling, completion rules, preview and publishing. It closes and reopens; closing clears the highlight. Admin pages have contextual tours.
- Admin activity cards use readable action descriptions and direct links to the relevant lesson, ticket, account or recovery request. Historical details take precedence over current target names. Missing historical data remains explicitly marked. Account/recovery/ticket links select the intended record; lesson links open the shared preview.
- The earlier `134aa7c` release placed reading/video acknowledgements in one final checklist. Practice and exam requirements remain server-checked. Student and teacher/admin preview share the lesson renderer.

## Verification and limits

- `npm test`: 54 tests passed. Includes meaningful context-size/approval-snapshot regressions and existing authorization, job, media, portal and note checks.
- `node scripts/check-refined-ui.cjs`: passed, including safe structured response rendering, closed-by-default guide and encoded activity destinations.
- `npm run build:portals` and `npm run build`: passed.
- Production bundle markers confirmed for all three portals. Live admin health API returned PostgreSQL-backed data and no server errors during the check. Activity → exact controlled draft preview and activity → exact ticket conversation were checked in the browser; no content was published or credentials changed.
- All ten lesson-tour steps highlighted a real target. Close cleared the highlight. Desktop and 390px mobile captures saved; mobile document width did not exceed the viewport. A real browser Python example printed `Nova`.
- Live developed builder consultation passed in **39.709 seconds**, with one generation attempt and free-provider fallback. It returned headings, practical teaching steps and runnable example text. This is a successful answer, **not proof of consistently low latency**.
- Four subsequent cases (code proposal, summary proposal, builder long-file reading, main teacher long-file reading) were blocked by `AI_RATE_LIMITED`. Do not report this suite as completely passing. The previous release had passing code (6.443s), summary (17.306s) and main-teacher long-file (5.406s) examples; those are historical results, not fresh passes for this release.
- No additional student online request was sent after the provider rate limit. Student independent review remains enabled. Configured credentials do not prove current provider availability. Free-only routing remains enforced; no paid model or paid web-search service was enabled.

## Evidence and handoff

The handoff ZIP contains current source, SHA-256 manifest, role and deployment documentation, build/test logs, current AI result JSON (including failures) and UI captures. No private credentials, environment secrets or database dump is included. The separate older Liara package was left untouched and is not a synchronized copy of this release.

Live portals: [Teacher](https://nova-teacher.onrender.com/) · [Student](https://nova-student.onrender.com/) · [Admin](https://nova-admin-veea.onrender.com/).
