# FlashGenius AI - Windows Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Application
**Easiest way - Double-click:**
```
start.bat
```

**Or from command line:**
```bash
npm start
```

### 3. Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

## Manual Setup (if needed)

### 1. Install Node.js
- Download from: https://nodejs.org/
- Install version 18 or higher

### 2. Verify Installation
```bash
node --version
npm --version
```

### 3. Install Project Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Environment Configuration
The `.env` file is already configured with:
- ✅ MongoDB Atlas connection
- ✅ Google Gemini API key
- ✅ JWT secrets

### 5. Start Development Servers

**Option A: Automatic (Recommended)**
```bash
# From project root
npm start
```

**Option B: Manual**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

**Option C: Windows Batch File**
```bash
# Double-click start.bat or run:
start.bat
```

## Troubleshooting

### Port Already in Use
If you get port errors:
- Backend (3001): Change `PORT` in `backend/.env`
- Frontend (3000): It will auto-suggest port 3001

### MongoDB Connection Issues
- Verify internet connection
- Check MongoDB Atlas cluster is running
- Ensure IP address is whitelisted in MongoDB Atlas

### Node.js Issues
- Ensure Node.js 18+ is installed
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## Features Available

✅ **User Registration & Login**
✅ **Document Upload** (TXT, PDF)
✅ **AI Flashcard Generation** (Google Gemini)
✅ **Interactive Study Sessions**
✅ **Progress Tracking & Points**
✅ **Responsive Design**

## Development Commands

```bash
# Start both servers
npm run dev

# Start individual servers
npm run dev:backend   # Backend only
npm run dev:frontend  # Frontend only

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Test TypeScript compilation
npm run test-build
```

## Need Help?

1. Check that all dependencies are installed
2. Verify Node.js version (18+)
3. Ensure ports 3000 and 3001 are available
4. Check internet connection for MongoDB Atlas
5. Restart the application if needed

Happy coding! 🚀