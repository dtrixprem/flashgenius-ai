import express from 'express';
import { generateFlashcards } from '@/services/geminiService';

const router = express.Router();

// Test endpoint for flashcard generation
router.post('/generate-flashcards', async (req, res) => {
  try {
    const { text, cardCount = 8 } = req.body;
    
    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Text must be at least 50 characters long'
      });
    }

    console.log('Test generation - Input text length:', text.length);
    console.log('Test generation - Requested card count:', cardCount);

    const flashcards = await generateFlashcards(text, cardCount);
    
    // Debug information
    const debugInfo = {
      totalCards: flashcards.length,
      averageQuestionLength: flashcards.length > 0 ? Math.round(flashcards.reduce((sum, card) => sum + card.question.length, 0) / flashcards.length) : 0,
      averageAnswerLength: flashcards.length > 0 ? Math.round(flashcards.reduce((sum, card) => sum + card.answer.length, 0) / flashcards.length) : 0,
      shortestQuestion: flashcards.length > 0 ? Math.min(...flashcards.map(card => card.question.length)) : 0,
      longestQuestion: flashcards.length > 0 ? Math.max(...flashcards.map(card => card.question.length)) : 0,
      shortestAnswer: flashcards.length > 0 ? Math.min(...flashcards.map(card => card.answer.length)) : 0,
      longestAnswer: flashcards.length > 0 ? Math.max(...flashcards.map(card => card.answer.length)) : 0,
    };

    console.log('Test generation - Debug info:', debugInfo);
    
    res.json({
      success: true,
      data: {
        flashcards,
        count: flashcards.length,
        debug: debugInfo,
        usingFallback: !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here'
      }
    });
  } catch (error) {
    console.error('Test generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Simple test endpoint to verify routes are working
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Test routes are working',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to check API configuration
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      geminiApiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here'),
      mongodbConfigured: !!process.env.MONGODB_URI,
      nodeEnv: process.env.NODE_ENV || 'development'
    }
  });
});

export default router;