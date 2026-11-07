@echo off
cd /d "%~dp0"
set PORTAL_ROLE=admin
set PORT=3103
node scripts/portal-server.cjs
pause
