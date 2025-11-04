'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { leaderboardAPI } from '@/lib/api';

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  currentStreak: number;
  longestStreak: number;
  isCurrentUser: boolean;
}

interface WeeklyEntry {
  rank: number;
  name: string;
  weeklyPoints: number;
  sessionsCompleted: number;
  isCurrentUser: boolean;
}

interface UserStats {
  totalSessions: number;
  totalCardsReviewed: number;
  totalCorrectAnswers: number;
  totalPointsEarned: number;
  averageAccuracy: number;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all-time' | 'weekly'>('all-time');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<WeeklyEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      const [leaderboardRes, weeklyRes, statsRes] = await Promise.all([
        leaderboardAPI.getLeaderboard(),
        leaderboardAPI.getWeeklyLeaderboard(),
        leaderboardAPI.getUserStats()
      ]);
      
      setLeaderboard(leaderboardRes.data.data.leaderboard || []);
      setCurrentUserRank(leaderboardRes.data.data.currentUserRank);
      setWeeklyLeaderboard(weeklyRes.data.data.weeklyLeaderboard || []);
      setUserStats(statsRes.data.data.stats || null);
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
      // Set empty arrays so the UI shows "no data" instead of crashing
      setLeaderboard([]);
      setWeeklyLeaderboard([]);
      setUserStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dominant flex items-center justify-center">
        <div className="text-lg text-white font-mono">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dominant">
      {/* Header */}
      <header className="bg-secondary shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white font-sans">🏆 Leaderboard</h1>
              <p className="text-white/75 font-mono">See how you rank against other learners</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-secondary border border-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-semibold font-sans transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* User Stats */}
          <div className="bg-secondary overflow-hidden shadow-lg rounded-xl mb-6 border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-semibold text-white mb-4 font-sans">
                Your Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-start font-mono">{user?.totalPoints || 0}</div>
                  <div className="text-sm text-white/75 font-mono">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-end font-mono">{currentUserRank || 'N/A'}</div>
                  <div className="text-sm text-white/75 font-mono">Global Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-start font-mono">{userStats?.totalSessions || 0}</div>
                  <div className="text-sm text-white/75 font-mono">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-end font-mono">{userStats?.totalCardsReviewed || 0}</div>
                  <div className="text-sm text-white/75 font-mono">Cards Studied</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-start font-mono">{userStats ? Math.round(userStats.averageAccuracy * 100) : 0}%</div>
                  <div className="text-sm text-white/75 font-mono">Avg Accuracy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-secondary shadow-lg rounded-xl border border-gray-700">
            <div className="border-b border-gray-600">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('all-time')}
                  className={`py-4 px-6 text-sm font-semibold border-b-2 font-sans ${
                    activeTab === 'all-time'
                      ? 'border-accent-start text-accent-start'
                      : 'border-transparent text-white/75 hover:text-white hover:border-gray-500'
                  }`}
                >
                  🏅 All-Time Leaderboard
                </button>
                <button
                  onClick={() => setActiveTab('weekly')}
                  className={`py-4 px-6 text-sm font-semibold border-b-2 font-sans ${
                    activeTab === 'weekly'
                      ? 'border-accent-start text-accent-start'
                      : 'border-transparent text-white/75 hover:text-white hover:border-gray-500'
                  }`}
                >
                  📅 This Week
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'all-time' ? (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 font-sans">Top Learners (All Time)</h3>
                  {leaderboard.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🎯</div>
                      <p className="text-white/75 text-lg font-mono">No data available yet.</p>
                      <p className="text-white/50 font-mono text-sm">Start studying to appear on the leaderboard!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leaderboard.map((entry) => (
                        <div
                          key={entry.rank}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                            entry.isCurrentUser
                              ? 'bg-accent-start/10 border-accent-start/50 shadow-md'
                              : 'bg-dominant border-gray-600 hover:border-accent-start/30'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                              entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                              entry.rank === 2 ? 'bg-gray-300 text-gray-700' :
                              entry.rank === 3 ? 'bg-orange-400 text-orange-900' :
                              'bg-gray-600 text-white'
                            }`}>
                              {entry.rank <= 3 ? (
                                entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
                              ) : (
                                entry.rank
                              )}
                            </div>
                            <div>
                              <div className={`font-semibold font-sans ${entry.isCurrentUser ? 'text-accent-start' : 'text-white'}`}>
                                {entry.name} {entry.isCurrentUser && '(You)'}
                              </div>
                              <div className="text-sm text-white/75 font-mono">
                                🔥 Current streak: {entry.currentStreak} • 🏆 Best: {entry.longestStreak}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-accent-start font-mono">{entry.points.toLocaleString()}</div>
                            <div className="text-sm text-white/75 font-mono">points</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 font-sans">Top Performers This Week</h3>
                  {weeklyLeaderboard.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📚</div>
                      <p className="text-white/75 text-lg font-mono">No activity this week yet.</p>
                      <p className="text-white/50 font-mono text-sm">Be the first to start studying!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {weeklyLeaderboard.map((entry) => (
                        <div
                          key={entry.rank}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                            entry.isCurrentUser
                              ? 'bg-accent-end/10 border-accent-end/50 shadow-md'
                              : 'bg-dominant border-gray-600 hover:border-accent-end/30'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                              entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                              entry.rank === 2 ? 'bg-gray-300 text-gray-700' :
                              entry.rank === 3 ? 'bg-orange-400 text-orange-900' :
                              'bg-gray-600 text-white'
                            }`}>
                              {entry.rank <= 3 ? (
                                entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
                              ) : (
                                entry.rank
                              )}
                            </div>
                            <div>
                              <div className={`font-semibold font-sans ${entry.isCurrentUser ? 'text-accent-end' : 'text-white'}`}>
                                {entry.name} {entry.isCurrentUser && '(You)'}
                              </div>
                              <div className="text-sm text-white/75 font-mono">
                                📖 {entry.sessionsCompleted} sessions completed this week
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-accent-end font-mono">{entry.weeklyPoints.toLocaleString()}</div>
                            <div className="text-sm text-white/75 font-mono">points this week</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Test Data Button (for development) */}
          {leaderboard.length === 0 && (
            <div className="mt-6 bg-secondary border border-accent-start/30 rounded-xl p-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-accent-start mb-2 font-sans">No Data Yet?</h3>
                <p className="text-white/75 mb-4 font-mono text-sm">
                  Complete a study session to earn points, or click below to add test data:
                </p>
                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/leaderboard/test-data', { 
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                      });
                      alert('Test data added! Refreshing...');
                      await fetchData();
                    } catch (error) {
                      alert('Failed to add test data');
                    }
                  }}
                  className="bg-accent-gradient text-dominant px-4 py-2 rounded-xl font-semibold font-sans hover:opacity-90 transition-all"
                >
                  Add Test Data
                </button>
              </div>
            </div>
          )}

          {/* Motivational Section */}
          <div className="mt-6 bg-accent-gradient rounded-xl p-6 text-dominant">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2 font-sans">Keep Learning! 🚀</h3>
              <p className="font-mono text-sm opacity-90">
                Study regularly to climb the leaderboard and maintain your streak!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}