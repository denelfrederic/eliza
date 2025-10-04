@echo off
cd /d "C:\Cursor_Projects\eliza\test-agent"
echo Building project...
call bun run build
echo Starting agent...
set ELIZA_DISABLE_UPDATE_CHECK=true
set IGNORE_BOOTSTRAP=true
call bunx elizaos start

