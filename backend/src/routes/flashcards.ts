import express from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import {
  getDecks,
  getDeckCards,
  startStudySession,
  completeStudySession,
  updateFlashcard
} from '@/controllers/flashcardController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const updateCardValidation = [
  body('question').optional().trim().isLength({ min: 1 }),
  body('answer').optional().trim().isLength({ min: 1 }),
];

const completeSessionValidation = [
  body('cardsReviewed').isInt({ min: 0 }),
  body('correctAnswers').isInt({ min: 0 }),
  body('cardResults').optional().isArray(),
];

// Routes
router.get('/decks', getDecks);
router.get('/decks/:deckId/cards', getDeckCards);
router.post('/decks/:deckId/study-session', startStudySession);
router.put('/study-sessions/:sessionId/complete', completeSessionValidation, validateRequest, completeStudySession);
router.put('/cards/:cardId', updateCardValidation, validateRequest, updateFlashcard);

export default router;