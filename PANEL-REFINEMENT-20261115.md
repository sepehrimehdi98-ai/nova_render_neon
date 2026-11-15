# Recovery, courses and AI interface refinement

The current Persian RTL visual system is preserved. Admin retains green navigation and paper/cream surfaces; teaching tools retain their blue accents; student AI follows the green student theme. Changes are scoped to these product surfaces and shared chat controls.

## Recovery
The admin recovery inbox now separates the request list from identity review/private delivery. It uses distinct status colors with text labels, a process lane, an explicit manual-delivery label and a useful unselected state. Private issued codes have a separate amber treatment. Guidance is collapsible. The review area stacks under the list on tablet/phone rather than squeezing the form. Existing identity checks, code expiry/reissue, session revocation and role restrictions are unchanged.

## Courses
Course administration now has a searchable catalog, a selected-course summary and separate lesson/publication, chapter/order and course-status sections. Course creation is a compact disclosure. Lesson previews reuse the exact student experience; they do not record student progress. Publication still uses the current draft revision and server validation. Course counts are derived from actual returned lessons, with unknown counts shown while data is unavailable. The selected course and tab survive background catalog refreshes, and stale preview responses are ignored after switching courses. Member links carry the selected course ID. No sample course or lesson was created by this design pass.

## AI
Student and teacher replies share a safe fenced-code/plain-text renderer with code copy, keyboard-scrolling and clear unverified-code guidance. Raw HTML is escaped, not executed. Student sample history with inactive controls was replaced by actual messages from the current in-memory conversation; this does not claim persistent history. The displayed account name comes from the session API. Copy/retry controls work, errors are distinct and the availability label distinguishes configured online mode/local lookup/unknown connection. New-chat is disabled while a response is pending so a reply cannot land in a newly cleared conversation. Chat requests, model review, sources and teacher approval are unchanged.

Teacher chat/composer refinements improve message grouping, file selection targets, short-screen scrolling, code readability and phone-sized controls. Student styling follows green, handles long text and keeps the composer within the viewport. Admin AI monitoring uses distinct queue-status colors with labels; no new administrator chat capability is introduced. Reply generation/authorization are not redesigned.

## Verification and limits
49 regression tests passed before publication. TypeScript and all3 portal production builds are run after the final changes. Component-render checks in scripts/check-refined-ui.cjs verify escaped AI/code content, course title escaping, segmented recovery markup, student UI without fabricated account/history and teacher composer rendering. These are not browser pixel/layout assertions.

The computer-use tool could not initialize because of missing kernel assets. No fresh desktop/mobile screenshot or click-through verification is claimed. Admin API authentication can be tested independently; it does not sign the user's visible browser in. Responsive rules target desktop, tablet, phone and coarse-pointer controls, but visual/device inspection remains outstanding. Browser links should use a new release query to load the latest entry bundle.

Private credentials, live cookies, document contents, recovery codes and database dumps are excluded from delivery packages. Live checks must avoid editing existing courses, notes, passwords or user content during this design-only rollout.

## Meta-inspired continuation
The user's follow-up requests Meta-style refinement. This is interpreted as familiar clean surfaces and hierarchy, not a claim of official Meta design-system compliance: white surfaces, soft gray canvas, restrained blue primary actions, rounded controls and clear selection states. Student green accents, Persian RTL, Nova branding and existing role layouts remain. Admin summary decorations are simplified; semantic status colors and textual labels remain. Styles are scoped through nova-interface-meta and role-aware recovery dialogs rather than replacing the product.

Small-screen adjustments include wrapping layouts, 44px coarse-pointer controls, 16px phone form fields, scrollable code/messages, short-height composer accommodation and a hidden/inert closed student chat drawer with Escape support. These are implementation checks, not screenshots from actual devices. No new course, publication, recovery token or password change is needed to verify this visual rollout. Role login and live AI checks should use existing authorized accounts without logging credentials.

Student AI now displays an explicit course/lesson context selector based on authorized published content and prerequisite locks. Context is captured on the question, selectors are disabled while a reply is pending, and empty/error/retry states prevent silent fallback to an unrelated first course. The existing server authorization remains authoritative.

## Live release verification
Application commitbcddb19f61796b47e91ea14745fd9fc33eee71e3 is deployed on Render. All3 public portals served the nova-interface-meta styling.49 regression tests passed; TypeScript, student/teacher/admin builds and the API Docker-equivalent combined build passed. Component checks passed for safe AI/code rendering (including inline fences), escaped course titles, the recovery split layout and role chat rendering.

Live checks at2026-11-15T15:17:12Z authenticated all3 original role accounts withHTTP200. Admin course/recovery permissions, hierarchy and preview payloads, published lesson counts, scoped note state and teacher/admin ticket privacy passed. One accessible course in this check had4 lessons and0 chapters; the interface reflects actual data and does not invent chapters. Existing courses, lessons, notes and passwords were not edited.

Real OpenRouter requests completed for teacher and student: teacher9063ms, student6964ms end to end. Server timing: teacher queue497ms/processing6339ms; student queue535ms/processing4251ms. Student verification was model-reviewed; no fenced Python examples were requested. Teacher verification retained source-ID checks and review requirements for generation. These are single short conceptual-question samples, not latency guarantees or a new factual-accuracy benchmark. One labeled technical teacher conversation and two AI jobs were created for this check; no AI proposal was applied to a lesson.

API authentication was verified independently; the agent could not sign the visible browser in because its computer-use tool failed to initialize. Refreshed admin course/recovery links can be opened in Codex, but this does not attest a browser session or screenshot. Fresh screenshot/mobile-device visual verification remains unavailable. Evidence in the originating workspace: work/meta-ui-render.log, meta-ui-tests.log, meta-ui-build.log, meta-ui-api-build.log, meta-ui-release-status.json and meta-ui-live-verification.json.
