# Role login visual restoration and functional controls

Student retains its existing Persian split form/code-preview design. Teacher retains its existing story/form composition. Admin retains the former purple story, white form and code-preview composition in a dedicated scoped component, rather than importing the generic app and global stylesheet for authentication. Blue N/نووا branding, Vazirmatn and designer credits remain. Dashboard components and their layouts are not replaced.

Student/teacher recovery controls now use the existing protected recovery request/completion API. Teacher login now shows inline failures, prevents duplicate pending submissions and has appropriate credential autocomplete. Student username autocomplete is corrected; the inactive remember-me/signup controls are replaced with accurate account guidance instead of promising unsupported behavior. Admin recovery remains the private offline-code flow from the preceding update, not full two-factor login. Controls include visible focus, pending/disabled states and phone-sized inputs. Explicit /login routes render without depending on /me succeeding.

Components: frontend/design/student/login/page.tsx, teacher/App.tsx, admin/Login.tsx and admin/login.css, AccountRecovery.tsx and account-recovery.css. Admin main.tsx uses its dedicated login component. Existing student/teacher styles and post-login dashboards remain in place.

Local review URLs: http://127.0.0.1:3101/login, http://127.0.0.1:3102/login, http://127.0.0.1:3103/login. Local credentials are student/teacher/admin with NovaDemo-2026!; do not use those development credentials for production.

Browser inspection could not initialize because of missing kernel assets. No fresh screenshot or pixel-match claim is made. Build/API/regression results are recorded in work/login-restoration-build-20261115.log and work/login-restoration-tests-20261115.log in the originating workspace. These source changes are local, not newly deployed to Render.

Final checks:47 regression tests passed and TypeScript/all3 portal builds passed. Every local /login page, entry JavaScript, referenced stylesheet, role login and authenticated /me returned HTTP200. Built entry scripts contain the expected role login design components. Teacher /login was queued in the Codex browser. Asset/API checks do not certify rendered pixel equivalence.


## Follow-up: direct login entry and recovery isolation
Student, teacher and admin login entry points now render their dedicated form before importing the dashboard App. Teacher Login was extracted without replacing its existing layout/CSS. Authenticated dashboard imports are lazy, reducing the login dependency on unrelated editor/analytics modules. Admin recovery components explicitly render only for the admin build; backend role restrictions remain unchanged.

Fresh local URLs use /login?refresh=entry2 to avoid focusing an old tab without a new navigation. All three HTML/entry assets returned200. TypeScript/all3 builds and47 regression tests passed. Native React server rendering of each login component confirmed a form/password field and admin recovery present only for admin, absent for teacher/student. Reproduce with node scripts/check-login-components.cjs from the project root. This is a component render test, not a browser screenshot or CSS-layout assertion.

Playwright CLI was available locally, but browser/session startup failed with EPERM even after granting requested cache access. Direct Edge capture also failed with OS access-denied process/channel errors. No screenshot file was produced and no security sandbox was disabled. Current design remains visually unverified by the agent; the new URLs were queued in the user's Codex browser. No Render deployment performed.
