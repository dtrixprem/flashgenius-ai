import express from 'express';
import { authenticateToken } from '@/middleware/auth';
import {
  getLeaderboard,
  getWeeklyLeaderboard,
  getUserStats
} from '@/controllers/leaderboardController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Test endpoint to add sample data
router.post('/test-data', async (req, res) => {
  try {
    const { User } = require('@/models/User');
    const { StudySession } = require('@/models/StudySession');
    
    // Add some points to the current user for testing
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        }
      });
    }
    
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (user) {
      user.totalPoints += 100;
      user.currentStreak = 3;
      user.longestStreak = 5;
      await user.save();
      
      // Create a test study session
      const testSession = new StudySession({
        userId,
        deckId: new (require('mongoose')).Types.ObjectId(),
        startedAt: new Date(),
        completedAt: new Date(),
        cardsReviewed: 10,
        correctAnswers: 8,
        pointsEarned: 100,
        sessionType: 'review'
      });
      
      await testSession.save();
    }
    
    res.json({
      success: true,
      message: 'Test data added successfully'
    });
  } catch (error) {
    console.error('Test data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add test data'
    });
  }
});

// Routes
router.get('/', getLeaderboard);
router.get('/weekly', getWeeklyLeaderboard);
router.get('/stats', getUserStats);

export default router;