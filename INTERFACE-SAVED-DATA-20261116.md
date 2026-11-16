# Chat, profile and saved-record reports — 2026-11-16

Student chat now uses a quiet neutral surface border while typing. The textarea has no colored outline or filled focus box. Keyboard focus remains indicated around the composer surface. Teacher/builder composers use the same quiet focus treatment. The legacy student sidebar SVG now draws N instead of M and uses the blue brand color.

Profile avatar frames and emoji glyphs have explicit sizing, clipping and isolated layout. Long names/usernames wrap; selected-avatar indicators stay within their tiles. Mobile actions wrap separately from the avatar grid.

Admin navigation includes **اطلاعات ذخیره‌شده** (`/?page=records`). It reads `GET /admin/data?dataset=courses|lessons|tickets|activity&offset=0`. The endpoint requires an authenticated admin and uses whitelisted report columns and fixed pagination of 100 rows. It returns administrative metadata only, excluding private student note bodies, chat/ticket message bodies, passwords, keys, tokens and sessions. The view links back to related course/lesson/ticket pages. CSV and JSON exports explicitly contain the displayed page; use pagination to export further pages. These reports are not a full database backup.

CSV has UTF-8 encoding and spreadsheet-formula escaping, including formulas preceded by whitespace. JSON preserves exact values. Existing backup encryption, database configuration, AI provider behavior, and note autosave are unchanged.

Validation: 59 automated tests and the autosave lifecycle harness passed. New backend checks cover actual writes appearing in reports, access denial for student/teacher, pagination without duplicate rows and exclusion of private/security fields. Export checks captured and decoded actual CSV/JSON Blobs, including Persian, quotes and formula-like text. All role builds, main build and component checks passed. Local servers were restarted with the existing database preserved; all four report datasets returned successfully. Fresh screenshot verification is unavailable because the browser automation runtime cannot initialize; visual appearance on actual devices remains unverified.
