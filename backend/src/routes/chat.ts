import express from 'express';
import { sendMessage } from '@/controllers/chatController';
import { authenticateToken } from '@/middleware/auth';
import { validateChatMessage } from '@/middleware/validation';

const router = express.Router();

// Health check for chat service
router.get('/health', (req, res) => {
  const isConfigured = process.env.GEMINI_API_KEY && 
                      process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here' &&
                      process.env.GEMINI_API_KEY !== 'your-actual-api-key-goes-here' &&
                      process.env.GEMINI_API_KEY !== 'your-new-gemini-api-key-here' &&
                      process.env.GEMINI_API_KEY !== 'PUT_YOUR_NEW_API_KEY_HERE';

  res.json({
    success: true,
    data: {
      status: isConfigured ? 'available' : 'unavailable',
      configured: isConfigured,
      timestamp: new Date().toISOString()
    }
  });
});

// Send chat message
router.post('/message', authenticateToken, validateChatMessage, sendMessage);

export default router;