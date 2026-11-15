# Admin oversight and recovery

## Where to find the changes
- Health/events: color-coded system analysis bands for published/draft/archived courses, process errors and historical blocked AI jobs. Course table links to the selected course and shows current publication status, published/draft lesson counts and number of assigned teachers. Labels carry meaning independently of color; narrow layouts wrap and tables scroll within their container.
- Audit table: role/search filters, Persian action names, actor/time/target and course links. Newly recorded lesson actions capture title, course ID, draft revision, publication version, status and block-kind counts at the time of the action. Exam/ticket/media actions capture limited relevant metadata. Private ticket messages, file contents, passwords and recovery codes are not copied into audit details. Older rows explicitly lack historical snapshots; current joins must not be mistaken for historical state. This is an application audit log, not immutable/tamper-proof storage or keystroke tracking. It displays at most100 recent entries.
- Admin account settings: password-confirmed generation of8 private160-bit random recovery codes. Codes are displayed once, stored only as domain-separated SHA-256 hashes, and must be kept offline. Generating a new set invalidates the old set.
- Admin login: recover with username, a previously saved recovery code and a new password (12–256 characters). Recovery is rate limited and transactional, invalidates all old codes, revokes sessions/reset tokens and writes an audit event. Code replay and use of another code from the consumed set are rejected. No recovery codes are configured automatically for a live admin.

## Recovery scope
This is single-use recovery-code authentication, not TOTP/SMS/email two-factor login. It does not silently enable MFA. An attacker possessing an unused recovery code and the username can reset the password, so protect these codes as strongly as passwords. Codes are excluded from application backups to avoid resurrecting old recovery credentials. After restoring a database or using a code, sign in and generate a new set. Operator recovery remains available through backend/scripts/platform-admin-recover.js; it also invalidates old reset/recovery codes. Keep operator credentials/variables private and remove recovery variables after use.

## Database changes
Additive nova_admin_recovery_codes and nova_audit_details tables and nova_audit_date index are created through existing schema initialization. PostgreSQL/SQLite both supported. No live migration performed in this task; back up/export and run normal staging verification before deployment.

## Verification
Canonical commands: npm run test; npm run build:portals. The test suite includes a real local HTTP journey for admin code setup/reset/session revocation/replay rejection, role isolation, teacher draft update/publication audit metadata, course status counts and teacher/admin tickets. The ticket test verifies public reply delivery, hidden internal notes and status synchronization; audit output excludes private note contents. The new fixture initially lacked required publication content; it was corrected to include video/exercise/quiz without weakening production validation.

Final results are recorded in the originating workspace work/admin-oversight-tests-20261115.log and work/admin-oversight-build-20261115.log. Browser visual verification remains unavailable due to computer-use initialization failure; no new screenshots or live UI interaction are claimed. These are local changes, not a new Render deployment.

Final verification:45 tests passed (38 backend,3 demo,3 portal,1 video-source helper). TypeScript and student/teacher/admin production builds passed; offline Python assets copied. ZIP integrity is checked by the packaging script. No production account credentials or recovery codes were changed.
