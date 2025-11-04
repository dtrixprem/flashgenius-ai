import { Types } from 'mongoose';

// Common type definitions
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path?: string;
}

export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentDTO {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  gcsPath: string;
  extractedText?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardDeckDTO {
  id: string;
  userId: string;
  documentId: string;
  title: string;
  description?: string;
  totalCards: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardDTO {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timesReviewed: number;
  correctAnswers: number;
  lastReviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySessionDTO {
  id: string;
  userId: string;
  deckId: string;
  startedAt: Date;
  completedAt?: Date;
  cardsReviewed: number;
  correctAnswers: number;
  pointsEarned: number;
  sessionType: 'review' | 'practice' | 'test';
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: UserDTO;
  token: string;
  refreshToken: string;
}