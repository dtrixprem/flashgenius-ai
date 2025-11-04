@echo off
echo 🚀 Starting FlashGenius AI (Simple Mode)...
echo.

echo 📝 Note: This will start the app with a local MongoDB connection.
echo    If you don't have MongoDB installed, the backend will show connection errors
echo    but the frontend will still work for UI testing.
echo.

echo 🎨 Starting frontend server...
start "FlashGenius Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo 🔧 Starting backend server...
start "FlashGenius Backend" cmd /k "cd backend && npm run dev"

echo.
echo 📝 Application URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001
echo.
echo 💡 To fix MongoDB connection:
echo    1. Install MongoDB locally, OR
echo    2. Use MongoDB Atlas (cloud) - see backend/.env.mongodb-atlas
echo.
echo Press any key to exit...
pause >nul