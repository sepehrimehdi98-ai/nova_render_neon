@echo off
cd /d "%~dp0"
set PORTAL_ROLE=teacher
set PORT=3102
node scripts/portal-server.cjs
pause
