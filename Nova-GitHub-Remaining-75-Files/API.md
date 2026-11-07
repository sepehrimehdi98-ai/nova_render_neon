# Frontend API contract

Base `/api/platform`. GET reads; POST mutates with application/json and exact configured Origin. Authenticate with an HttpOnly session cookie. Errors: `{error:string}`; 401 requires login, 403 denies access, 409 requires refetching the current revision, 429 throttles requests.

- POST /login {username,password}; GET /me; POST /logout {}. Navigate by the server-returned user.role.
- GET/POST /courses; GET /courses/:id; GET/POST /courses/:id/members and POST /courses/:id/status (admin).
- POST /courses/:id/lessons; GET/POST /lessons/:id with draftRev; POST /lessons/:id/publish {draftRev}; POST /lessons/:id/unpublish. Teachers publish directly.
- GET/POST /lessons/:id/versions lists history or restores a version into a draft using version,draftRev.
- GET /courses/:id/structure; POST /courses/:id/modules; POST /courses/:id/organize {revision,order,layout,prerequisites}.
- POST /lessons/:id/practice {version,submissionId,code}; POST /lessons/:id/quiz {version,attemptId,answers}; POST /lessons/:id/progress {version,videoAcknowledged:true}; POST /lessons/:id/complete {version}. Use UUID submission/attempt IDs for retries.
- GET /lessons/:id/submissions; POST /submissions/:id/review {revision,grade,feedback}; GET /lessons/:id/grading.
- GET/POST /profile, /profile/details, /notes, /lesson-note; POST /notes/delete; POST /account/password. Analytics: GET /my/analysis and /courses/:id/analysis.
- Admin: GET/POST /users; POST /users/:id/active; GET /admin/recovery; POST /users/:id/recovery {identityConfirmed:true}. Public recovery: POST /recovery/request and /recovery/complete.

## Exams

GET/POST /courses/:id/exams. Create {title,questions:[{prompt,options,correct}],opensAt,closesAt,durationMinutes,passScore,status}. Updates also send id,revision. Content changes are rejected once attempts exist.
POST /exams/:id/start {}; GET /exams/:id/attempt; POST /exams/:id/save or /submit {answers:[number|null]}; GET /exams/:id/results (staff); POST /exams/:id/status (staff). Serialize autosaves. Deadlines are enforced server-side and expired attempts use saved answers.

## Tickets

GET /tickets returns the permitted inbox. POST /tickets {subject,body,category,priority,courseId?} is teacher-only. Categories: content|technical|account|other. Priorities: normal|high.
GET /tickets/:id returns ticket and filtered messages. POST /tickets/:id/messages {revision,body,internal?}; internal notes are admin-only. POST /tickets/:id/status {revision,status}; admin statuses: open|in_progress|waiting_teacher|resolved; teacher statuses: open|resolved. POST /tickets/:id/assign {revision} assigns the current admin. POST /tickets/:id/read {} marks read.

## AI and media

GET /capabilities. GET/POST /courses/:id/ai/jobs; create {lessonId,question,publicTopic?}, then poll GET. Teacher jobs snapshot unpublished drafts and draftRev. Students receive published content without private tests or answer keys.
POST /lessons/:id/ai-apply {jobId,draftRev} appends the reviewed author answer as a draft note; ownership and snapshot revisions are checked. It never publishes automatically.
GET/POST /courses/:id/ai/sources; POST /courses/:id/ai/approve. GET/POST /lessons/:id/local-chat performs labeled offline search.
GET/POST /media: {courseId,title,mime,content:base64}, maximum 6 MB. POST /media/:id/review {approved,reason} is admin-only. GET /files/:id is authenticated and supports ranges. Publication requires local media to be approved and belong to the course.
GET/POST /courses/:id/library. GET /workers, /admin/operations; POST /admin/backup.

Executable examples and permission checks: backend/test/*.test.js. Shared client: frontend/src/live/api.ts. Live provider compatibility still needs staging verification.

## Separate portal entry points

Role builds call `/api/platform/portal/{student|teacher|admin}/...` through their own gateway. The gateway rejects another portal namespace and adds its own namespace to unprefixed media/API URLs. The backend enforces the namespace against the authenticated account and uses a separate HttpOnly host-only cookie per role. Existing unprefixed API routes remain compatible and retain normal role authorization. Do not set a shared parent Domain cookie.
