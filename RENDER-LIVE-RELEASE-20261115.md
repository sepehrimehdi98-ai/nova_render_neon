# Render live release — 2026-11-15

Application code commit: 561ee07d0eddf5a8ea736efa5c7b94592a334ef6. All58 changed/new files were checked against GitHub blob hashes with no mismatches. The publication excluded private account files, environment secrets, database files, dependency directories and compiled bundles. Existing Liara package was untouched.

## Live addresses
- Student: https://nova-student.onrender.com/login
- Teacher: https://nova-teacher.onrender.com/login
- Admin: https://nova-admin-veea.onrender.com/login
- API health: https://nova-api-8s4w.onrender.com/api/platform/health

## Live verification
At2026-11-15T13:47:06Z all three existing role accounts authenticated with HTTP200 and returned the correct session role. Each public portal served its updated login entry bundle. Admin operations returned the new courseSummary/security fields with PostgreSQL and a valid backup key. Four courses were visible to admin.

Teacher/student admin-operations access returned403; teacher admin-recovery-code access returned403; student tickets access returned403. Teacher/admin shared5 ticket records, and3 corresponding threads were checked for matching access and private-note filtering. No live ticket messages were created by this verification.

A real student note was read and saved with the same text and its current revision. Revision advanced, a repeat with the stale revision returned409, and a new read confirmed exact text preservation. No student note content is included in this report. The check changed only note revision/update metadata (and may create an empty note record if none existed).

Database health responded successfully; AI readiness was true with a recent, nonstale AI worker heartbeat. These are health/contract checks, not a new live AI answer-quality benchmark or a full security audit.47 regression tests and all3 production builds passed locally before publication. Component-render checks confirmed forms and admin-only recovery; browser screenshot tools remained unavailable, so no fresh pixel/layout verification is claimed.

## Recovery setup and operational limits
Admin recovery has0 unused codes on the live account at this snapshot. Sign in as admin → account settings → secure admin recovery, confirm the current password, generate8 codes and keep them offline. This is recovery-code authentication, not full two-factor login. Production credentials were not changed or published.

Render free-service cold starts and provider limits still apply. Historical blocked AI jobs are not a current waiting queue. Backups require durable external export; local server backups alone are insufficient. The dated earlier reports describe prepublication local states; this report supersedes their deployment status only.

Evidence in the originating workspace: work/render-release-status.json, work/render-live-verification-20261115.json, login-entry-fix-build.log and login-entry-fix-tests.log. Release confirmation uses live artifacts/API contracts; Render's private build logs and runtime commit attestation were not available through a connector.
