# Liara deployment

Use four applications: a central API using Dockerfile, and three frontend gateways using Dockerfile.portal with build argument PORTAL_ROLE=student, teacher or admin. Each exposes port 3003 inside its container. See DOMAINS.md for domains and environment configuration. All API processes and workers share PostgreSQL.

1. Select the app, database and HTTPS domain before deployment.
2. Configure backend/.env.liara.example values privately in Liara. DATABASE_URL must use the actual database hostname and port, not localhost. APP_ORIGIN must be the exact HTTPS API origin without a trailing slash. APP_ORIGINS must list the three exact HTTPS portal origins, comma-separated. Configure API_UPSTREAM on each portal gateway to the API origin or verified private network endpoint.
3. Verify the database endpoint's TLS capabilities. The package requires certificate-verifying TLS in production. If the chosen endpoint supports only private-network plaintext, an explicit transport-policy change and review is required before deployment. Do not disable certificate verification as a workaround. No Liara endpoint was available to validate here.
4. Run `node backend/scripts/platform-migrate.js` and `node backend/scripts/database-check.js` in the target environment. The latter checks tables, reachability and TLS.
5. Privately set BOOTSTRAP_ADMIN_USERNAME, BOOTSTRAP_ADMIN_NAME and BOOTSTRAP_ADMIN_PASSWORD; run `node backend/scripts/platform-admin.js`; remove those variables before starting the server. The production Docker command does not seed demo accounts.
6. Set DATABASE_POOL_MAX within the total web/worker connection budget. Configure NOVA_TRUSTED_PROXIES only from the actual trusted ingress addresses.
7. Attach durable private backup storage at /app/backups with write access for the image's node user. Set BACKUP_ENCRYPTION_KEY to a random 32-byte base64 key, stored separately from backups. Verify restore into an empty staging database.

AI worker: `node backend/scripts/ai-worker.js`, with LIARA_AI_BASE_URL, LIARA_AI_API_KEY, LIARA_AI_CHAT_MODEL and LIARA_AI_EMBEDDING_MODEL. Web capability reporting also needs the relevant AI configuration. Keys remain server-side.

Grading worker: `node backend/scripts/grading-worker.js`, with NOVA_GRADER_IMAGE pinned to a digest on a dedicated Docker-capable host. Do not mount a Docker socket into the web app. Do not assume a Liara application container supports nested Docker. AI example verification also needs an isolated runner.

Before launch: build the container; verify /api/platform/live and /health; test all three role logins, direct teacher publication, tickets, private-note isolation, exam persistence, logout, backup recovery, provider compatibility and worker completion through the actual HTTPS ingress.

Schema initialization adds tables transactionally. Future changes to existing columns need explicit versioned migrations; CREATE TABLE IF NOT EXISTS does not migrate existing definitions.

Documentation consulted: https://github.com/liara-cloud/docs/blob/master/src/pages/paas/nodejs/how-tos/deploy-app.mdx and https://www.npmjs.com/package/@liara/cli . Node 24 is fixed by the Docker image rather than an assumed managed-runtime version. No deployment was performed.
