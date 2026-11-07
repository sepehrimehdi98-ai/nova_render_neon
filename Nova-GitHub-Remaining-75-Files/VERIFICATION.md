# Verification — 2026-11-05

Passed: TypeScript checking; production frontend build for all three entry points; 12 backend tests; 3 expanded test cases with 68 feature HTTP assertions; 3 portal tests (18 tests total).

Coverage includes ticket ownership, student denial, hidden admin notes, revision conflicts, resolve/reopen, assignment permissions; unpublished teacher draft AI snapshot through stubbed review and explicit apply to direct publication; stale AI apply rejection; exam timing, saved answers across restart, immutable submitted scores and answer-key isolation; media review and byte ranges; UTF-8 chunk preservation; password-reset/login race prevention; trusted-proxy parsing; original encrypted SQLite backup/restore.

Limits: PostgreSQL transaction tests use a pool double. No hosted Liara database was contacted. AI responses and grading runners are test doubles. Docker image build and real isolated execution have not been run. Earlier browser inspection covered login, courses and local search; final ticket/AI changes have build and API coverage, not a final complete browser walkthrough.

The three role portals build independently from shared React components. Local HTTP integration tests cover all three gateways, HTML/assets, independent cookies, simultaneous sessions, wrong-role login rejection, protected endpoints, logout and Origin rejection. This package is prepared for staging integration; live service checks in DEPLOY-LIARA.md remain required before production release.

## Additional validation pass

All combined and independent student/teacher/admin production builds and TypeScript checks passed again. Server and script JavaScript syntax checks passed.

Added a real-password HTTP workflow through all three portal gateways (31 checks): admin creates a course and assigns membership; teacher drafts, publishes and updates a lesson; student sees only published content and submits exercise/quiz answers; teacher retrieves the resulting report; teacher and admin exchange tickets; admin internal notes remain private; student ticket access is rejected; stale ticket writes conflict; withdrawing enrollment immediately removes lesson access. This runs against real local SQLite, not a mocked API. Separate existing tests verify restart persistence.

Added TLS configuration regression tests: production refuses disabled TLS, retains certificate verification for both supported secure modes, strips connection-string SSL overrides, and preserves a configured CA. These test configuration, not a real TLS handshake.

Fixed a production startup issue: portal gateways now reject a missing API_UPSTREAM instead of falling back to their own default port. Upstream URLs containing credentials, paths, query strings or fragments are rejected. Tests cover the failure cases.

Browser verification was attempted with both available computer-use entry points; both failed to initialize with `failed to write kernel assets: The system cannot find the path specified`. No new browser interaction or screenshot pass is claimed. Static HTML/assets and API behavior were checked over HTTP. Docker and PostgreSQL CLI were not available in this environment, so real container builds and a real PostgreSQL integration test remain outstanding. Live AI, isolated grading and Liara services remain unverified as described above.
