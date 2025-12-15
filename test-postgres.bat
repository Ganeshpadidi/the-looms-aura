@echo off
echo Checking PostgreSQL connection...
echo.

REM Try to connect with psql
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres -c "SELECT current_user, version();"

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo SUCCESS! Password is correct.
    echo ============================================
    echo.
    echo The password you just entered works!
    echo Use this exact password in your .env file.
    echo.
) else (
    echo.
    echo ============================================
    echo Password incorrect or PostgreSQL not found
    echo ============================================
    echo.
    echo Try:
    echo 1. Open pgAdmin 4 to verify your password
    echo 2. Check if PostgreSQL is installed in a different location
    echo.
)

pause
