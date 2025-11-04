import express from 'express';
import { generateFlashcards } from '@/services/geminiService';

const router = express.Router();

// Test endpoint for flashcard generation
router.post('/generate-flashcards', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Text must be at least 50 characters long'
      });
    }

    const flashcards = await generateFlashcards(text);
    
    res.json({
      success: true,
      data: {
        flashcards,
        count: flashcards.length,
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