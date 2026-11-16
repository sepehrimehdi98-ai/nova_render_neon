# Reference planner, note autosave and selected avatars — 16 November 2026

Implementation API release: 2f8e1de, with a follow-up planner date-navigation refinement. Current main contains the final source. Render/Neon is the maintained edition; the separate older Liara edition was not changed.

## Planner and homepage design
Both roles use the same screenshot-based planner component: compact task rows, daily summary cards, right-side form, search, today/week/all controls, priority pills, colour swatches, category, edit controls and colour legend. Homepage reminders reuse compact rows and summary cards. Real data is retained; counters are calculated, not copied from the screenshot. Course classes/exam deadlines remain distinct from personal work. The responsive layout stacks on small screens; it is not expected to retain three desktop columns on a phone.
Personal task colours and order persist in nova_planner_style with owner validation. Drag handles and keyboard menu controls reorder personal tasks; course events are read-only in this list. Reordering cannot accept another account's task IDs. The All view can retrieve future personal tasks, subject to the 500-record response bound. Moving a task's start preserves its duration. Future saves open the relevant range. Private-task statistics do not assert course attendance.

## Automatic notes
Browser drafts persist immediately while typing. After one second of inactivity, the current account/lesson note saves to the API with the current revision. The top status shows pending, saving, saved or conflict/error state. Routine buttons below the editor are removed; export and account-refresh functions remain in the top options menu. Conflict resolution remains explicit and pauses automatic writes; no other version is silently overwritten.
Network retries back off, reconnect checks refresh the account copy, request timeouts are bounded, and local drafts survive failures. Editing during an in-flight save schedules the newer text. Late responses from a previous lesson/account generation cannot replace the new note state. Initial typing before an empty account copy arrives is retained. Existing input size limits, literal-text treatment, account/lesson isolation and bilingual report exports remain.

## Header avatar
The own-profile endpoint returns the chosen preset and validated uploaded image. The shared header uses that selection beside the account name and refreshes on the existing profile-updated event. It does not expose another person's image. Preset selection remains the existing avatar system; an uploaded PNG/JPEG is displayed as an image.

## File AI reliability
Selected file metadata is included in tutor context. Vague file questions are interpreted against the chosen document. File-specific answers without a valid citation to a selected document are withheld rather than replaced with unrelated lesson facts. Independent review and the labelled direct-excerpt fallback remain enabled. The AI is told not to claim full-document coverage when only excerpts are available.
Live controlled TXT question: correct countdown-timer answer, owned-file citation and independent review; 29.794 seconds end to end. This is not a claim of consistently low latency, universal correctness or live verification of every file type. Free-provider availability and daily quota still vary; no paid route was enabled.

## Verification
57 automated tests passed, plus the new autosave hook lifecycle harness. The harness checks rapid initial typing/debounce, newer typing during a save, conflict pause/explicit approval and lesson-switch isolation. It is not a substitute for a real-browser test. Backend tests cover saved colour/order, foreign-owner rejection, future tasks, invalid colours, uploaded-avatar visibility and refusal of ungrounded file answers. TypeScript, all three portal builds, API build and component-render checks passed.
Live PostgreSQL API checks passed for selected avatar consistency, saved task colour, order, completion and file-answer grounding. Verification plans were left completed. No real student note or existing class schedule was changed by live tests.
Fresh browser/screenshot verification could not run: the computer-use tool failed initialization because its kernel assets could not be written. Do not claim pixel-perfect matching or current browser autosave verification. Older screenshots in the handoff are historical, not proof of this revision.

Evidence: reference-planner-tests.log, reference-note-autosave.log, reference-follow-build.log, reference-follow-api-build.log, reference-follow-components.log and reference-live.json. Use npm test to rerun automated checks. The live URLs are https://nova-student.onrender.com/planner and https://nova-teacher.onrender.com/?page=planner.
