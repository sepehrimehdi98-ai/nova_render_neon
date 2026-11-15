# Admin operations, role distinction and backup safeguards

## Implemented locally
- Health page displays real process counters (requests, 5xx errors, slow requests >1s, process start/uptime and last error), timestamped data, worker heartbeats, AI/grading status counts and capability configuration. Counters reset on process restart; job counts include history, not only currently waiting work. A recent heartbeat is not proof a model request will succeed.
- Backup area shows whether an encryption key is valid, AES-256-GCM behavior, last recorded backup creation and local ephemeral storage limits. It never displays the encryption key. Password storage is identified as salted scrypt hashing, not reversible encryption.
- Audit events are filterable by role and search; server supplies actor role and target identifier. At most100 recent records are displayed. Admin endpoint remains forbidden to teacher/student.
- Accounts have role-specific filters/counts and textual colored labels for admin/teacher/student. These are display filters; server permissions remain authoritative.
- Backup key requires canonical base64 encoding of exactly32 bytes. Invalid keys fail closed. Backups are written to a private temporary file, flushed and atomically renamed; interrupted temporary files do not appear as finished .backup files. Restore validates envelope fields/IV/tag, authenticates ciphertext before database access, and retains existing empty-database and transactional restore safeguards.

## Verification
44 tests pass:37 backend +3 demo +3 portals +1 teacher video helper. Added tests reject malformed keys, modified ciphertext, incorrect keys and malformed IVs before database writes; existing encrypted restore roundtrip still passes. Added health response/role boundary assertions. TypeScript and all3 production builds pass. Vite reports the existing ineffective dynamic import warning; builds complete.

Live read-only check: admin authentication HTTP200, /admin/operations HTTP200 with PostgreSQL, backupConfigured=true, 285 process requests at that sample and100 recent audit records; /workers HTTP200 with recent AI worker heartbeat,35 completed and8 blocked historical AI jobs, no grading jobs; /users HTTP200 with3 accounts across admin/teacher/student. Those are snapshots of the deployed earlier code, not proof the new local UI is deployed. No live backup or data mutation was performed.

The currently open browser tab could not be inspected or controlled: computer-use initialization failed with missing kernel assets. HTTP authentication succeeds independently and does not sign the user's browser tab in. No new mobile screenshots or browser interactions verified in this pass.

## Security scope and recovery
No overall security guarantee. This hardens encrypted backups, not independent field encryption of all database data. Database-at-rest encryption remains a hosting-provider responsibility and is not attested by this page. Existing TLS, role checks, salted password hashes, origin/session controls remain. Keep the encryption key in server secrets and a separately secured recovery location; losing it makes backups unrecoverable. Never rotate/remove it without retaining the old key for old backups. Export backups from Render to durable external storage and test recovery on a separate empty database. Off-site export/rotation scheduling is not implemented here.

Deploy status: local source/package only; no GitHub push or Render deployment in this pass. Logs: work/health-security-tests-20261115.log and work/health-security-build-20261115.log in the originating workspace.
