# Nova Render + Neon edition

Start with START-HERE-RENDER.md. Deploy render.yaml from the repository root. This copy is independent of the Liara package.

# Nova platform — local and Liara deployment package

Requires Node.js 24+. Three independently deployable frontend builds share reusable React components and a central Node API. Each portal has its own login, role-specific dashboard and host-only session cookie. See DOMAINS.md.

## Local use

Run `npm start` or `Start-Nova.cmd`, then start Start-Student.cmd, Start-Teacher.cmd and Start-Admin.cmd. Visit http://127.0.0.1:3101, http://127.0.0.1:3102 and http://127.0.0.1:3103 respectively. The original combined preview remains at http://127.0.0.1:3003. Built frontend assets and the offline Python runtime are included. The SQLite demo does not require installing PostgreSQL dependencies.

Demo usernames: `student`, `teacher`, `admin`. Password: `NovaDemo-2026!`.

The seed runs only against an empty local database. Restarting preserves records in `backend/data/nova-platform.sqlite`. Never deploy the demo database. To develop, run `npm run setup`, then `npm run build`, `npm run build:portals` and `npm test`. For Vite development, set backend APP_ORIGIN to http://127.0.0.1:5173 and run `npm run dev` separately.

## Features

- Student: courses, video, browser Python, submissions, quizzes, timed exams, private notes, profiles and analytics.
- Teacher: block authoring, drafts, direct publication, revisions, modules, prerequisites, exams, grading and class reports.
- AI: saved consultation on unpublished draft snapshots; reviewed suggestions can be explicitly added to a draft. Stale suggestions are rejected. Publication remains a separate teacher action.
- Admin: accounts, enrollment, course oversight, recovery, media approval, audit logs, backups and workers.
- Tickets: teacher ownership, admin replies and private notes, unread counts, statuses, reopening, self-assignment and revision checks. Ticket attachments are not implemented.

Generative AI requires configured Liara AI and workers. Offline lesson search is explicitly labeled. Automatic grading and AI example verification require an isolated Docker-capable worker; browser output is not a trusted grade. Manual grading works locally.

Media uploads are limited to 6 MB and stored in the database. Large production videos require a separately verified streaming/storage integration. The bundled CC0 flower clip demonstrates playback, not educational content.

See DEPLOY-LIARA.md, API.md and VERIFICATION.md. No app name, domain or credentials are hardcoded for deployment.
