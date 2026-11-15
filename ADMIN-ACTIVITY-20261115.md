# Admin activity log refinement

The administrator's activity history and dashboard recent activities now share AuditEvent.tsx. Persian sentences explain who acted, their role, the recorded action and related content. Category labels and colors distinguish learning, assessment, support, accounts/security and files. Technical action codes and target identifiers are inside a keyboard-operable native details control. The search matches Persian descriptions as well as names, titles and identifiers. Role filtering and the 100-event retrieval limit remain unchanged.

Recorded status, lesson versions and block counts use readable Persian labels. Older records without stored historical details explicitly say so; a current course name is not presented as a historical snapshot. Unknown action codes receive a neutral description and remain available in technical details. This view is recorded activity, not a complete log of failed requests or proof of every security event.

No backend endpoint, permission, database, password, course content or ticket message was changed. React escapes all displayed values; no raw HTML or private message bodies are rendered. Shared category colors also have text labels. Cards wrap on narrow layouts.

Validation: npm test (49 tests), node scripts/check-refined-ui.cjs (including plain-language log/search, escaping, collapsed details, missing history and unknown-action checks), npm run build:portals, npm run build. Browser screenshot/device visual inspection remains blocked by the local browser runtime; component/build checks are not screenshot evidence.

Live checks and release reference are recorded in work/audit-live-verification.json outside the public source package. Fresh entry: https://nova-admin-veea.onrender.com/?page=health&release=activity-log .
