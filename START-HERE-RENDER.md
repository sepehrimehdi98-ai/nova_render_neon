# OpenRouter Render demo update

Set OPENROUTER_API_KEY privately on nova-api. The Blueprint selects AI_PROVIDER=openrouter and nvidia/nemotron-3-ultra-550b-a55b:free, with OPENROUTER_FREE_ONLY=true. Paid fallback and web search are disabled. The API starts its AI worker in the same service. Free Render sleep interrupts processing; queued jobs recover after their ten-minute lease. Free model quotas and availability are not guaranteed.

RAG defaults to local keyword vectors, without embedding API charges. This is keyword retrieval, not semantic embeddings or model training. Optional OPENROUTER_EMBEDDING_MODEL requires OPENROUTER_FREE_ONLY=false and may cost money. Python examples still require an isolated grader; unverified generated code is withheld without it. Conceptual answers can pass without code execution. Automatic web harvesting is not implemented.

## Hosted demo data
Use an EMPTY dedicated Neon database before bootstrapping an admin. Set DATABASE_URL, DATABASE_SSL=verify-full, NOVA_SEED_CONFIRM=empty-demo-database and NOVA_SEED_PASSWORD (at least 16 characters) in private backend/.env. From the root run `node backend/scripts/demo-seed.js` after installing backend dependencies. This creates admin, teacher and student accounts, a shared course, three published lessons, quizzes, an exam and library content. Existing databases are preserved. Log in with your configured seed password; remove seed variables afterwards. Never commit .env. Remove demo accounts before real use.

Original sample charts and layouts are preserved. Chart values are illustrative fixtures, not measured live analytics. Supervisor sample users/tickets are separate from real account and ticket APIs. Seeded lessons are actual database records. Some original mock controls remain unconnected; this package is for deployment and demonstration, not a claim of complete production integration.

See VALIDATION.md for local results. Live OpenRouter, Neon and Render checks require your credentials and deployment.

---

# Nova on Render and Neon

This is a separate copy for Render. The Liara folder and ZIPs are preserved.

## Deployment

1. Create a Neon PostgreSQL project near your Render region. Copy its pooled connection string privately. Use the direct connection for migration/administration if your pool endpoint rejects administrative operations.
2. Push this folder to a private Git repository. In Render choose New Blueprint, connect the repository and use render.yaml.
3. Supply DATABASE_URL only on nova-api. Certificate verification is enabled. APP_ORIGIN is derived from Render's RENDER_EXTERNAL_URL at startup. If you later attach a custom API domain, set APP_ORIGIN explicitly.
4. Set APP_ORIGINS on nova-api to the exact three HTTPS portal origins, comma-separated, without trailing slashes. Actual Render hostnames can have suffixes. You may initially use intended domains, then update after Render allocates the real hostnames.
5. Set API_UPSTREAM separately on each portal to the actual HTTPS backend origin. Correct it after allocation if needed. The portal health checks fail until the backend is reachable. Redeploy after changing configuration.
6. PORTAL_ROLE is provided as a Docker build argument and runtime variable by Render. Each portal builds its own design. Container listeners use Render's PORT and 0.0.0.0.
7. Startup initializes additive schema tables transactionally. To check before release, run backend/scripts/platform-migrate.js and backend/scripts/database-check.js locally against the staging Neon database using a private environment file. Node 24 and npm --prefix backend ci are required.
8. Create the first admin with backend/scripts/platform-admin.js using temporary BOOTSTRAP_ADMIN_USERNAME, BOOTSTRAP_ADMIN_NAME and BOOTSTRAP_ADMIN_PASSWORD. Run this locally with the Neon connection; remove bootstrap variables afterward. Never place them on the running service.
9. Run scripts/check-portals.cjs with NOVA_TEST_STUDENT_ORIGIN, NOVA_TEST_TEACHER_ORIGIN, NOVA_TEST_ADMIN_ORIGIN and matching _USERNAME/_PASSWORD environment variables. Create accounts, enrollment and a published test lesson first. This check logs in, reads and logs out without modifying lessons.

## Free hosting boundaries

All four services are free web services. They SHARE Render's 750 instance-hour monthly allowance. Idle services sleep, and cold starts may require refreshing after the API wakes. Four continuously active services exceed the allowance. This arrangement is for intermittent demonstrations within the provider quotas. Monitor usage in Render and Neon.

Neon stores persistent application records. Render free disks are ephemeral. Local backup files and SQLite are unsuitable as deployed storage. Save database exports outside Render and verify a restore before production. Use Neon-supported backup/export procedures; the existing admin local-backup screen is not a durable Neon backup solution.

The OpenRouter AI worker starts inside nova-api when its key is configured. Automatic grading still requires a dedicated isolated Docker runner outside this free web Blueprint.

The existing frontend feature limitations carry into this package: the teacher/admin inbox integration is still pending, several exam/analytics screens use sample behavior, and real accounts/tickets are distinct from administrator sample collections. This hosting adaptation does not complete those product features.

## Verification and references

Local code tests cover persistence and role boundaries. Live Render containers, Neon TLS connectivity and browser workflows require the configured accounts. No deployment was performed.

Render blueprint: https://render.com/docs/blueprint-spec
Render Docker build variables: https://render.com/docs/docker
Render free limits: https://render.com/docs/free
Neon connections: https://neon.com/docs/connect/connect-from-any-app
