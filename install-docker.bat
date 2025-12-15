@echo off
echo ============================================
echo  Docker Desktop Download Helper
echo ============================================
echo.
echo This will open Docker Desktop download page in your browser.
echo.
echo After installation:
echo 1. Restart your computer
echo 2. Launch Docker Desktop
echo 3. Come back and run: docker compose up -d
echo.
echo Press any key to open download page...
pause > nul

start https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe

echo.
echo Download should have started!
echo After installing Docker Desktop, run these commands:
echo.
echo   cd C:\Users\ganes\.gemini\antigravity\scratch\the-looms-aura
echo   docker compose up -d
echo   cd server
echo   npm run seed
echo.
pause
