# Nova backend — 2026-11-04

This is a standalone Node.js API package. It contains no frontend, visual design, real user database, credentials, node_modules or build output.

## Local setup
1. Install Node.js 24 or newer.
2. Run `npm install` in this folder.
3. Use development settings: `NODE_ENV=development`, `APP_ORIGIN=http://127.0.0.1:3003`, `PORT=3003`, `NOVA_DEMO_MODE=false`. Leave DATABASE_URL unset to use local SQLite. Optional NOVA_LOCAL_DB selects the SQLite file.
4. Run `npm run db:migrate`.
5. Privately set BOOTSTRAP_ADMIN_USERNAME, BOOTSTRAP_ADMIN_NAME and BOOTSTRAP_ADMIN_PASSWORD (a strong password of at least 12 characters), then run `npm run admin:create`. Remove those three variables immediately afterward.
6. Run `npm test`, then `npm start`.
7. Check GET /api/platform/live and /api/platform/health. No HTML interface is included, so / returns 404.

The bundled loader reads local environment files; never commit or distribute filled environment files. Alternatively set process environment variables directly.

## PostgreSQL and deployment
Use .env.example as a variable template. Set DATABASE_URL privately, NODE_ENV=production, NOVA_DEMO_MODE=false, APP_ORIGIN to your exact HTTPS frontend origin without a trailing slash, PORT to the hosting port, and verified TLS settings and CA certificate required by your database service. Run db:migrate and db:check against the intended staging database before startup. db/schema.sql is an export of the authoritative schema in lib/platform/store.js; do not maintain them independently. The table order puts referenced tables before notes/profile tables.

Deploy the API behind the same origin as the frontend, forwarding /api/platform/* to this server. It uses HttpOnly session cookies and validates mutation Origins. It does not enable permissive cross-origin access. A frontend on another host needs a same-origin reverse proxy or a separately reviewed CORS/cookie integration.

## Frontend contract
All routes below start with /api/platform. Login is POST /login with username and password; the returned user.role determines navigation. GET /me restores the session; POST /logout ends it. Do not choose a privileged role client-side.
- GET/POST /profile: avatar selection (integer 1–8).
- GET/POST /profile/details: full name, phone and address. These fields are contact data, not verified phone/OTP authentication.
- GET /lesson-note?lessonId=<UUID>: own private note for an accessible lesson.
- POST /lesson-note: lessonId and body; empty body deletes the note. Clients should serialize autosaves. Current API uses last-write-wins and has no multi-tab conflict revisions.
- GET/POST /notes and POST /notes/delete: personal general notes, ownership protected.
- POST /account/password: currentPassword and password; invalidates sessions.
Course enrollment, publication, submissions, quiz grading, analysis, recovery and AI routes are implemented in lib/platform/service.js, extensions.js, learning.js and rag.js. The integration tests show executable request examples and expected permissions.

## Workers and backups
AI and grading workers run separately using the same database. Configure LIARA_AI_* privately for `npm run ai:worker`. Configure a vetted NOVA_GRADER_IMAGE and an isolated Docker-capable worker for `npm run grading:worker`. Never execute untrusted Python directly on the web host.
Set BACKUP_ENCRYPTION_KEY to a securely generated 32-byte base64 key and BACKUP_DIRECTORY to durable private storage. Keep the encryption key outside the backup archive. Restore only into an empty test database and verify recovery before launch. See scripts/platform-backup.js for CLI arguments.

## Verification results and limits
The standalone package passed all 11 included tests on 2026-11-04. The suite exercised 80 course-workflow HTTP assertions, 56 extension checks, 41 learning checks, SQLite persistence after restart, encrypted backup/restore, password security, authorization, profile data isolation, avatars and lesson-note ownership/deletion.
PostgreSQL transaction tests use a pool test double. This is not proof of a real hosted PostgreSQL migration. Docker grading and AI execution are also test doubles. Live PostgreSQL migration/restore, Docker resource isolation, Liara model/embedding compatibility, Kavimo playback, domain/TLS and production deployment still require integration tests.
The backend does not implement every proposed feature from the uploaded UI prototype (for example its complete scheduled-exam system). Passing this suite does not certify those unimplemented screens.
