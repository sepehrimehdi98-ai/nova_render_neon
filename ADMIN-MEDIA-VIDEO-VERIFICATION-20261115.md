# Admin media and teacher video replacement — 2026-11-15

## Changes
- Preserved the current Persian RTL admin theme. Shared media library now separates videos, images/covers and PDF documents into titled sections with individual item boxes, counts, search, review-status filtering, empty states and refresh.
- Videos use preload=none to avoid fetching every media file while browsing. Existing authorized media URLs and admin approval/rejection controls remain intact.
- Added a single teacher video-source adapter used by both draft saving and student-style preview. It clears old sourceUrl/embedUrl/mediaId fields before selecting the replacement. It accepts authorized uploaded-file paths and validated Kavimo embeds, retains legacy IDs when unchanged, and keeps AI placeholder media incomplete until a URL is supplied.
- Fixed an actual stale-source bug: replacing an uploaded lesson video with a Kavimo embed could otherwise keep the original sourceUrl, which the backend/player prioritized.

## Verification
- Existing 42 tests passed (36 backend, 3 demo, 3 portal).
- Extended HTTP journey verifies teacher can save a new main-video embed, student still receives the old published video before publication, stale draft revisions return 409, and republishing exposes the replacement to the student. Demo journey now makes 74 HTTP assertions.
- New studio-video test passes: uploaded-file → embed and embed → uploaded-file replacements clear obsolete sources; original legacy ID and incomplete/invalid input states behave as expected. Canonical npm run test includes this test, using --test-isolation=none for compatibility with this environment.
- TypeScript and student/teacher/admin production builds passed; offline Python assets copied successfully.
- Initial separate helper test without --test-isolation=none hit environment spawn EPERM; rerun with the supported runner passed. That initial invocation is recorded in the raw log, not a remaining product failure.
- Browser visual verification could not run: computer-use initialization failed with “failed to write kernel assets: The system cannot find the path specified.” No claim of fresh screenshot verification or successful playback against a real new Kavimo asset is made. The HTTP test uses a syntactically valid test embed, not a playable user video.
- Changes are local in this package; no new GitHub push/Render deployment performed in this task. Previously measured live AI timings remain historical; today's new live AI test is not claimed.

## AI validity
Student generation retains model review and source/schema checks when applicable. Teacher proposals require teacher review/approval. Citation checking proves cited source IDs are allowed, not that every statement is true. Independent model agreement is not factual certainty. Executable Python examples can be withheld without the configured isolated grader. These changes do not weaken AI validation.
