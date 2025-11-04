# FlashGenius AI

AI-powered flashcard generation platform that transforms documents into intelligent, gamified flashcards.

## Features

- 🤖 **AI-Powered Generation**: Automatically create flashcards from TXT and PDF documents using Google Gemini API
- 🎮 **Gamification**: Points, leaderboards, and achievements to motivate learning
- 📱 **Modern Interface**: Built with Next.js and Tailwind CSS for a responsive experience

- 📊 **Analytics**: Track study progress and performance metrics
- ✏️ **Editing Tools**: Customize and organize your flashcard decks

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and state management
- **Framer Motion** - Animations and transitions

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type safety for backend code
- **Mongoose** - MongoDB ODM
- **MongoDB** - Primary database
- **Google Cloud Storage** - File storage
- **Google Gemini API** - AI flashcard generation


## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- MongoDB Atlas account (cloud database) or local MongoDB
- Google Cloud Platform account with Gemini API access


### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd flashgenius-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy example environment files
cp backend/.env.example backend/.env
```

4. Configure your environment variables in `backend/.env`

5. Start the application:

**Option 1: Automatic startup (Windows)**
```bash
start.bat
```

**Option 2: Manual startup**
```bash
# Start both servers
npm run dev

# Or start individually
npm run dev:backend  # Backend on port 3001
npm run dev:frontend # Frontend on port 3000
```

**Option 3: One-command startup**
```bash
npm start
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Project Structure

```
flashgenius-ai/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Reusable React components
│   │   ├── lib/            # Utility functions and configurations
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript type definitions
│   └── public/             # Static assets
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript type definitions
│   └── models/             # Mongoose models and schemas
└── docs/                   # Documentation
```

## Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications for production
- `npm run test` - Run tests for both applications
- `npm run lint` - Lint both applications

### Frontend
- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production
- `npm run test:frontend` - Run frontend tests

### Backend
- `npm run dev:backend` - Start backend development server
- `npm run build:backend` - Build backend for production
- `npm run test:backend` - Run backend tests

## Development Workflow

1. **Requirements**: Detailed in `.kiro/specs/flashgenius-ai/requirements.md`
2. **Design**: Architecture and technical design
3. **Implementation**: Follow the task list for incremental development
4. **Testing**: Comprehensive test coverage for all features
5. **Deployment**: Production-ready deployment on Google Cloud Platform

## Contributing

1. Follow the existing code style and conventions
2. Write tests for new features
3. Update documentation as needed
4. Follow the incremental development approach outlined in the specs

## License

This project is private and proprietary.