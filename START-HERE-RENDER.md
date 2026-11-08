# Render + Neon live demo

1. Create a Render Blueprint from this repository, main branch, render.yaml.
2. Enter only DATABASE_URL (the complete private Neon pooled PostgreSQL connection string) and OPENROUTER_API_KEY.
3. API_UPSTREAM is linked automatically to nova-api's RENDER_EXTERNAL_URL using fromService. You do not need to guess portal or API addresses. APP_ORIGIN is derived automatically in the API startup script.
4. The portal validates mutating browser requests against its own RENDER_EXTERNAL_URL before forwarding a normalized API origin. No wildcard origins or circular service dependencies are used. Free services use the public HTTPS API address because Render free web services cannot receive private-network traffic.
5. If adding a custom portal domain later, set PORTAL_ORIGINS on that portal to its exact HTTPS origin (comma-separated for several); retain the default Render URL. No trailing slashes. Never place DATABASE_URL or AI keys on portals.
6. After deployment confirm all four services are Live, then run scripts/check-portals.cjs using private per-role test credentials and actual HTTPS URLs. No live deployment was verified during development.

## Demo accounts
For an EMPTY dedicated demo Neon database, configure DATABASE_URL, DATABASE_SSL=verify-full, NOVA_SEED_CONFIRM=empty-demo-database and a private NOVA_SEED_PASSWORD (16+ characters) in backend/.env, then run node backend/scripts/demo-seed.js locally with Node 24 and backend dependencies installed. It creates admin/teacher/student accounts with that password, a shared course, lessons, quizzes, an exam and library content. Existing nonempty databases are preserved. Remove seed variables afterwards. Never commit .env. Production startup does not create accounts automatically.

For a real deployment instead, bootstrap an admin with backend/scripts/platform-admin.js and the documented BOOTSTRAP_ADMIN_* settings, then remove those variables before startup. PostgreSQL transport uses certificate-verifying TLS; never disable it to bypass connection failures. Back up before migrations/upgrades and export backups outside Render's ephemeral filesystem.

## Internal communication
Teacher Messages and Admin Support now use the shared /tickets API, not sample-state. Teachers create and reply to their own tickets. Admins reply, change status, and add internal notes hidden from teachers. Both screens poll every 15 seconds while visible. Errors are displayed, drafts are preserved on send failures, and stale revisions trigger refresh. Sample charts and sample student administration remain illustrative; connecting tickets does not make all mock screens production-ready.

## AI and hosting limits
See RAG-SETUP.md. OpenRouter chat worker starts inside nova-api when its key is configured. Web search and semantic embedding APIs are optional and may incur charges. Isolated Python grading needs a separate supported runner. Free Render services sleep and share the account's compute allowance. Cold starts can delay requests. User data lives in Neon; do not rely on the local container filesystem for persistence.

## Validation
2026-11-09: TypeScript and all three portal builds passed; 24 existing backend/portal tests plus the Render origin validation regression passed. Run the latter with node --test --test-isolation=none scripts/render-gateway.test.cjs. This tests request forwarding/rejection and cross-role ticket API flows locally. Browser interaction tests and real Render/Neon/OpenRouter checks remain pending.

Official Blueprint reference: https://render.com/docs/blueprint-spec
Private-network limitations: https://render.com/docs/private-network
