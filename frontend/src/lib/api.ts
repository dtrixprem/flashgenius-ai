import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Documents API
export const documentsAPI = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: () => api.get('/documents'),
  generateFlashcards: (documentId: string, cardCount: number = 10) =>
    api.post(`/documents/${documentId}/generate-flashcards`, { cardCount }),
};

// Flashcards API
export const flashcardsAPI = {
  getDecks: () => api.get('/flashcards/decks'),
  getDeckCards: (deckId: string) => api.get(`/flashcards/decks/${deckId}/cards`),
  startStudySession: (deckId: string) => api.post(`/flashcards/decks/${deckId}/study-session`),
  completeStudySession: (sessionId: string, data: any) =>
    api.put(`/flashcards/study-sessions/${sessionId}/complete`, data),
  updateCard: (cardId: string, data: { question?: string; answer?: string }) =>
    api.put(`/flashcards/cards/${cardId}`, data),
};

// Leaderboard API
export const leaderboardAPI = {
  getLeaderboard: () => api.get('/leaderboard'),
  getWeeklyLeaderboard: () => api.get('/leaderboard/weekly'),
  getUserStats: () => api.get('/leaderboard/stats'),
};