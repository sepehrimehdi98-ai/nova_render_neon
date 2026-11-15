# Student refinement — 16 November 2026

Implementation: a473571d02c9f431c8e48272cd1f49084f37139d, published to Render/Neon.

## Notes and reports
Lesson notes export a self-contained UTF-8 HTML report in Persian (RTL) or English (LTR), including lesson title/ID, account revision, export time, sync/conflict state and the exact current text. Original user content is not automatically translated. Local drafts are labelled; exporting does not sync or overwrite the account. Notes remain escaped plain text. Reports open offline and can be printed from a browser.

Personal analytics export Persian/English HTML and exact JSON. They include course, selected time range, UTC start/snapshot, current-version completion, visible exam results and daily activity seconds. Null/withheld scores remain distinct from zero. Scores are stored on the 100-point scale; chart values out of 20 are derived by division by five. Activity measures recorded lesson-page time, not proof of attendance or attention. Completion uses current published versions; scores/activity use the selected date window. Report values are drawn from the same personal API snapshot, not AI-generated statistics.

## Lesson and exam interface
An optional nine-section lesson tour explains navigation, video, code, practice, assessment, notes/privacy/export, completion and next lesson. Inapplicable sections are omitted. It highlights real controls and can be closed/reopened. The former permanent note instruction paragraph was removed. Existing note conflict handling, plain-text limits and account/lesson isolation are retained.
Exam listing uses one clear heading, course selector and student-green controls; duplicate headings were removed in the embedded view. Desktop and 390px mobile production captures show no horizontal document overflow.

## Student AI
Students can attach private PDF (text), DOCX, TXT and MD files, at most six per message, using the existing 1.5 MB/parser limits. Documents stay owned by the uploader in the enrolled published course. Teacher conversations, progress and other users' files remain restricted. Private student uploads are not automatically published or added to the shared approved vector index.
Selected documents feed ranked excerpts into the existing tutor pipeline. Evidence IDs/page metadata are preserved, ownership is rechecked after generation, source-based claims require citations, and independent review remains enabled. Repeated capability checks were removed from each message when configuration is already known. Public HTTPS link retrieval retains private-IP/DNS/redirect protections. Paid general web search remains disabled in the free deployment; link retrieval is not a guarantee of broad web search.

## Verification
- 55 automated tests passed, including private file access denial and reviewed student document responses.
- TypeScript, all three portal builds and API build passed.
- Component checks passed. Standalone report checks passed for Unicode, escaping, exact numeric precision, null/zero separation and scope metadata.
- Browser rejected unsupported extensions and oversized files with Persian errors.
- Live analytics API identity/range and computed aggregates passed. Downloaded Persian HTML and JSON matched snapshot metadata; live English note export included revision, sync status and original Unicode content.
- Live own-file AI response passed in 7.254 seconds, with correct Amber Otter answer, file citation and independent review.
- Live public Python documentation retrieval passed in 11.744 seconds, with source URL and independent review.
These are measured controlled successes, not guarantees of factual perfection, provider availability or every possible file. Free-provider latency/rate limits can vary. No existing lesson was published, no credentials were changed and no actual student note was overwritten during this verification.

Evidence: student-refinement-live.json, student-export-browser-check.json, student-refinement-tests.log, student-refinement-build.log, student-refinement-api-build.log, student-refinement-components.log and responsive screenshots. Actual private note export files and credentials are excluded from the handoff package.
