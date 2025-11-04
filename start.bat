@echo off
echo 🚀 Starting FlashGenius AI...
echo.
echo 📊 Using MongoDB Atlas (cloud database)...
echo.

echo 🔧 Starting backend server...
start "FlashGenius Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo 🎨 Starting frontend server...
start "FlashGenius Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo 📝 Application will be available at:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001
echo.
echo ⏳ Please wait for both servers to start...
echo.
echo Press any key to exit...
pause >nul