# Validation - 2026-11-07

Passed: TypeScript check; combined frontend production build; student, teacher and admin production builds; offline Python asset packaging; backend suite (15 tests), demo-feature suite (3), portal suite (3). Additional seeded RAG integration test passed afterwards, giving 22 passing tests across the current suite.

OpenRouter tests mock HTTP responses, covering endpoint/authentication/free routing, JSON parsing, rate-limit/error handling and local Persian/Python keyword retrieval. Integration test seeds three accounts and three lessons, verifies rerunning preserves them, processes student and teacher AI jobs, verifies completion and checks assessment keys/private grading tests are excluded from provider requests.

Existing tests cover authentication, role boundaries, course publication, persistence/restart, quizzes/exams, media, notes, tickets, encryption, origin rules and PostgreSQL TLS configuration. Grader uses test doubles, not actual Docker execution. These tests do not prove every original visual control is connected.

Liara source preservation manifest: all hashes unchanged. No design TSX or CSS files modified; only shared AI polling duration changed.

Not run: real OpenRouter call (no key), live Neon PostgreSQL handshake, Render Docker builds (Docker unavailable), browser visual inspection. Offline npm ci lacked cached tarballs; builds used existing local dependencies matching the unchanged lockfiles. Render will run npm ci from its registry-enabled build environment. A successful remote clean build remains a deployment check.

Sample charts are illustrative frontend fixtures, not live analytics. Hosted demo seeding is explicit and requires an empty database and a private password. No secrets, local database, or node_modules are included in the ZIP.
