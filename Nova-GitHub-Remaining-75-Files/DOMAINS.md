# Separate Nova frontends and domains

The following domains are examples, not registered or deployed addresses:

| Portal | Example production URL | Local URL | Build output |
|---|---|---|---|
| Student | https://student.example.com | http://127.0.0.1:3101 | portals/student/dist |
| Teacher | https://teacher.example.com | http://127.0.0.1:3102 | portals/teacher/dist |
| Admin | https://admin.example.com | http://127.0.0.1:3103 | portals/admin/dist |

Each opens directly to its own login and dashboard. A teacher account cannot log in at the student or admin entrance. Shared source components are reused; features and server authorization depend on the account role. They are separate deployable builds, not three duplicated codebases.

## Local operation

Node 24+ is required. Run Start-Nova.cmd first, then the three role launchers. All four processes must remain running. Each portal proxies its same-origin API requests to http://127.0.0.1:3003. Local data persists in backend/data/nova-platform.sqlite. The role session cookies use different names, so logging into the three localhost ports does not overwrite other role sessions.

Demo accounts: student / teacher / admin; password NovaDemo-2026!. Production never seeds these users automatically.

To rebuild: npm run setup (installs dependencies and builds all outputs). To verify: npm test. To update only role builds: npm run build:portals.

## Deployment wiring

Build the backend image with Dockerfile. Build each portal image from the project root, for example:

```sh
docker build -f Dockerfile.portal --build-arg PORTAL_ROLE=student -t nova-student .
docker build -f Dockerfile.portal --build-arg PORTAL_ROLE=teacher -t nova-teacher .
docker build -f Dockerfile.portal --build-arg PORTAL_ROLE=admin -t nova-admin .
```

Use Liara's Docker/image deployment workflow with one application per image. Actual application names, domain bindings, certificate provisioning and private endpoint addresses must be chosen in the target account. No cloud resources are created by this package.

On the API set NODE_ENV=production, APP_ORIGIN to the API HTTPS origin, APP_ORIGINS to the three portal HTTPS origins (comma-separated, no trailing slashes), and DATABASE_URL plus the other secrets in backend/.env.liara.example. On each portal set API_UPSTREAM to the central API origin or its verified private endpoint. Production startup fails if this setting is missing. The image fixes PORTAL_ROLE for that portal. Never place database or AI secrets in Vite variables or frontend files.

The browser communicates only with its own portal origin. The gateway forwards to the API; CORS is unnecessary for this topology. Session cookies have HttpOnly, SameSite=Strict, no Domain attribute and Secure in production. Keep HTTPS on all public entrances. Configure trusted proxy addresses explicitly if client-IP rate limiting is required behind ingress; untrusted forwarded headers are discarded.

## Readiness boundary

Frontend-to-API wiring is implemented and locally tested. This is a staging-ready integration package, not a verified live deployment. Before production validate the real PostgreSQL TLS connection and migrations, HTTPS/proxy cookies, backup restore, AI provider and worker execution, isolated grading worker and production video storage. See DEPLOY-LIARA.md and VERIFICATION.md for the outstanding service checks and test limitations.
