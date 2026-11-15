# Manual account recovery and future SMS seam

## Student and teacher
Each login has a prominent recovery button opening a focused, keyboard-accessible dialog. The user submits a username. Eligible teacher/student requests appear in the admin inbox and notification badge/banner, polled while visible at15-second intervals. Duplicate open/issued requests are coalesced. Unknown, inactive, administrator and wrong-portal usernames receive the same public response; no public request-status lookup exposes account existence. Submission alone does not change credentials or sessions.

After identity verification, the admin issues a private reset code. The user switches to the dialog's code step, pastes the code and chooses/confirms a new12–256-character password. The permanent password is never displayed to the admin, and old passwords cannot be recovered from salted hashes. A code is not a new permanent password; this is the safer equivalent of handing the account back to its verified owner.

## Admin
Open “بازیابی حساب‌ها” from the notification bell, navigation badge or banner. Review the account role, username and request time. Verify identity against trusted existing enrollment/contact records; a username, a newly supplied phone number or the request itself is not identity proof. Record a short verification result without passwords or sensitive identity documents, check the confirmation box, then issue a code. Alternatively reject an unverified open request with a reason.

The code is256 random bits represented as64 hexadecimal characters, expires after15 minutes and works once. It is shown only in the issuance response, not recoverable from subsequent API reads. Copy it and deliver through a trusted private channel to the verified requester. Never place it in a public ticket, shared notes or screenshots. The UI hides it on expiry, when the tab becomes hidden, or on explicit dismissal. Clipboard contents are outside the app's confidentiality boundary; handle them carefully. If delivery or the response is lost, reissue after verification; old codes become invalid.

Approval immediately disables the previous password and revokes sessions. The requester may be unable to log in until completing recovery. On completion all reset tokens and old sessions are invalidated, requests become resolved, and the user signs in with the chosen password. Replayed, expired, wrong-portal and stale-review requests are rejected. Concurrent resets are serialized by account locks and token rechecks. A stale code reissue requires refreshing the review version.

Admin self-recovery remains separate: private offline admin recovery codes or authorized operator recovery. An admin cannot approve their own identity through the public student/teacher request flow. This release does not add full two-factor login.

## Security and storage
Recovery APIs retain origin checks, role/owner validation, request bounds and IP attempt limits. Plaintext codes/passwords are not stored in notifications, review notes or audit metadata. Only code hashes are stored. Additive nova_recovery_verifications records admin review and a random review version; nova_recovery_status_date supports inbox lookup. Unknown-account responses are equal in content, not a guarantee of indistinguishable timing. In-app notifications are shared pending-work notifications, not per-admin read receipts or push notifications. Lists are bounded to100 requests and10 notification items.

Review notes are confidential administrative records; minimize their contents and retention. Database/backup protections and provider limits remain as previously documented. There is no overall security guarantee or independent identity verification service.

## Future SMS integration
backend/lib/platform/recovery-delivery.js is an explicit transport seam. Current capabilities report manual delivery and smsAvailable=false; attempting SMS returns503 before issuing a token or disabling a password. No SMS request, charge, credential or provider integration is present.

Before enabling SMS, add a server-side provider adapter and verified contact ownership, enforce destination/attempt limits, and deliver only after the database transaction commits. Use a durable encrypted outbox if retries are required; do not persist plaintext codes in a generic job/audit table. An SMS outage must not claim successful delivery. Keep verification, expiry, replay prevention, session revocation and manual fallback. A shorter numeric OTP requires a scoped challenge, strong attempt limits and separate protocol tests; do not simply shorten the current global reset token. SMS ownership alone is not full MFA or proof of educational identity.

## Verification
The recovery HTTP journey covers request deduplication, unknown-user parity, admin notifications, role denial, identity-note enforcement, rejection, code reissue/version checks, superseded-token rejection, concurrent completion (one200/one400), session revocation and successful new-password login. SMS fails closed without affecting existing access. The complete regression suite and three builds are run before publication; live testing uses dedicated temporary accounts and deactivates them afterwards. Existing real passwords must not be changed by testing.

The screenshot/browser tools remain blocked by OS process permissions. Component render and HTTP checks do not certify pixel-level design; no fresh screenshot verification is claimed.
