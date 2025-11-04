import { Response } from 'express';
import { User } from '@/models/User';
import { StudySession } from '@/models/StudySession';
import { AuthRequest } from '@/middleware/auth';

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    // Get top users by total points
    const topUsers = await User.find({})
      .select('firstName lastName totalPoints currentStreak longestStreak')
      .sort({ totalPoints: -1 })
      .limit(50);

    // Get current user's rank
    const currentUserId = req.user?._id;
    let currentUserRank: number | null = null;
    
    if (currentUserId && req.user) {
      const usersAbove = await User.countDocuments({
        totalPoints: { $gt: req.user.totalPoints }
      });
      currentUserRank = usersAbove + 1;
    }

    res.json({
      success: true,
      data: {
        leaderboard: topUsers.map((user, index) => ({
          rank: index + 1,
          name: `${user.firstName} ${user.lastName}`,
          points: user.totalPoints,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          isCurrentUser: currentUserId ? (user._id as any).toString() === currentUserId.toString() : false
        })),
        currentUserRank,
        totalUsers: await User.countDocuments({})
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LEADERBOARD_FETCH_FAILED',
        message: 'Failed to fetch leaderboard'
      }
    });
  }
};

export const getWeeklyLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get weekly points from study sessions
    const weeklyStats = await StudySession.aggregate([
      {
        $match: {
          completedAt: { $gte: oneWeekAgo }
        }
      },
      {
        $group: {
          _id: '$userId',
          weeklyPoints: { $sum: '$pointsEarned' },
          sessionsCompleted: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
          weeklyPoints: 1,
          sessionsCompleted: 1,
          isCurrentUser: {
            $eq: ['$_id', req.user?._id]
          }
        }
      },
      {
        $sort: { weeklyPoints: -1 }
      },
      {
        $limit: 50
      }
    ]);

    res.json({
      success: true,
      data: {
        weeklyLeaderboard: weeklyStats.map((stat, index) => ({
          rank: index + 1,
          name: stat.name,
          weeklyPoints: stat.weeklyPoints,
          sessionsCompleted: stat.sessionsCompleted,
          isCurrentUser: stat.isCurrentUser
        }))
      }
    });
  } catch (error) {
    console.error('Get weekly leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'WEEKLY_LEADERBOARD_FETCH_FAILED',
        message: 'Failed to fetch weekly leaderboard'
      }
    });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
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

    // Get user's study statistics
    const stats = await StudySession.aggregate([
      {
        $match: { userId }
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalCardsReviewed: { $sum: '$cardsReviewed' },
          totalCorrectAnswers: { $sum: '$correctAnswers' },
          totalPointsEarned: { $sum: '$pointsEarned' },
          averageAccuracy: { 
            $avg: { 
              $cond: [
                { $gt: ['$cardsReviewed', 0] },
                { $divide: ['$correctAnswers', '$cardsReviewed'] },
                0
              ]
            }
          }
        }
      }
    ]);

    const userStats = stats[0] || {
      totalSessions: 0,
      totalCardsReviewed: 0,
      totalCorrectAnswers: 0,
      totalPointsEarned: 0,
      averageAccuracy: 0
    };

    // Get recent activity (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentActivity = await StudySession.find({
      userId,
      completedAt: { $gte: oneWeekAgo }
    })
    .select('completedAt pointsEarned cardsReviewed correctAnswers')
    .sort({ completedAt: -1 })
    .limit(10);

    res.json({
      success: true,
      data: {
        stats: {
          ...userStats,
          averageAccuracy: Math.round(userStats.averageAccuracy * 100) / 100
        },
        recentActivity: recentActivity.map(session => ({
          date: session.completedAt,
          points: session.pointsEarned,
          cardsReviewed: session.cardsReviewed,
          accuracy: session.cardsReviewed > 0 ? 
            Math.round((session.correctAnswers / session.cardsReviewed) * 100) : 0
        }))
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_STATS_FETCH_FAILED',
        message: 'Failed to fetch user statistics'
      }
    });
  }
};