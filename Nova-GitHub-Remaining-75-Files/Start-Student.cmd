@echo off
cd /d "%~dp0"
set PORTAL_ROLE=student
set PORT=3101
node scripts/portal-server.cjs
pause
