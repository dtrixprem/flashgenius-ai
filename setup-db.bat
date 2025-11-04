@echo off
echo 🗄️ Setting up MongoDB for FlashGenius AI...
echo.

echo Checking if MongoDB is installed...
where mongod >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ MongoDB not found. Please install MongoDB Community Server from:
    echo    https://www.mongodb.com/try/download/community
    echo.
    echo Or use MongoDB Atlas (cloud) by updating the MONGODB_URI in backend/.env
    pause
    exit /b 1
)

echo ✅ MongoDB found!
echo.

echo Starting MongoDB service...
net start MongoDB 2>nul
if %errorlevel% neq 0 (
    echo Starting MongoDB manually...
    start "MongoDB" mongod --dbpath ./data/db
    timeout /t 3 /nobreak >nul
)

echo ✅ MongoDB is running!
echo.
echo You can now start the application with: npm start
pause