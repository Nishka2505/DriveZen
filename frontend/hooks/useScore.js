import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

// useScore.js — Full gamification score system
//
// What is AsyncStorage?
// It's like localStorage for React Native — it saves data
// permanently on the phone even after the app closes.
// We use it to save sessions, scores and achievements.
//
// Key/value storage:
//   key   = 'driveZen_sessions'
//   value = JSON string of all sessions
//
// This hook manages:
// - Saving completed driving sessions
// - Calculating total safety score
// - Tracking achievements
// - Weekly statistics
// - Leaderboard data (mock friends)

const STORAGE_KEYS = {
  SESSIONS: 'driveZen_sessions',
  SCORE: 'driveZen_score',
  ACHIEVEMENTS: 'driveZen_achievements',
  STREAK: 'driveZen_streak',
};

// Achievement definitions
const ACHIEVEMENTS_LIST = [
  {
    id: 'first_drive',
    title: 'First Drive',
    description: 'Complete your first Drive Mode session',
    icon: '🚗',
    points: 50,
    condition: (stats) => stats.totalSessions >= 1,
  },
  {
    id: 'five_drives',
    title: 'Road Regular',
    description: 'Complete 5 driving sessions',
    icon: '🏅',
    points: 100,
    condition: (stats) => stats.totalSessions >= 5,
  },
  {
    id: 'perfect_drive',
    title: 'Eyes on Road',
    description: 'Complete a session with zero distractions',
    icon: '👀',
    points: 75,
    condition: (stats) => stats.perfectSessions >= 1,
  },
  {
    id: 'safe_streak',
    title: 'Safety Streak',
    description: 'Complete 3 safe sessions in a row',
    icon: '🔥',
    points: 150,
    condition: (stats) => stats.currentStreak >= 3,
  },
  {
    id: 'hour_driver',
    title: 'Hour Driver',
    description: 'Accumulate 60 minutes of safe driving',
    icon: '⏱️',
    points: 200,
    condition: (stats) => stats.totalDriveMinutes >= 60,
  },
  {
    id: 'score_100',
    title: 'Perfect Score',
    description: 'Reach a safety score of 100',
    icon: '💯',
    points: 500,
    condition: (stats) => stats.safetyScore >= 100,
  },
];

export default function useScore() {

  const [sessions, setSessions] = useState([]);
  const [safetyScore, setSafetyScore] = useState(100);
  const [achievements, setAchievements] = useState([]);
  const [newAchievement, setNewAchievement] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ── LOAD DATA ON STARTUP ───────────────────────────────
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);

      // Load sessions from storage
      const sessionsJson = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      const loadedSessions = sessionsJson ? JSON.parse(sessionsJson) : [];
      setSessions(loadedSessions);

      // Load score
      const scoreJson = await AsyncStorage.getItem(STORAGE_KEYS.SCORE);
      const loadedScore = scoreJson ? JSON.parse(scoreJson) : 100;
      setSafetyScore(loadedScore);

      // Load achievements
      const achievementsJson = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      const loadedAchievements = achievementsJson
        ? JSON.parse(achievementsJson) : [];
      setAchievements(loadedAchievements);

      // Load streak
      const streakJson = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
      const loadedStreak = streakJson ? JSON.parse(streakJson) : 0;
      setCurrentStreak(loadedStreak);

      // Calculate weekly stats from sessions
      if (loadedSessions.length > 0) {
        calculateWeeklyStats(loadedSessions);
      }

    } catch (error) {
      console.log('Error loading score data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ── SAVE SESSION ───────────────────────────────────────
  const saveSession = useCallback(async (sessionData) => {
    try {
      const {
        duration,        // seconds
        distractionCount,
        maxSpeed,
        averageSpeed,
        wasAutoActivated,
      } = sessionData;

      // ── CALCULATE POINTS ─────────────────────────────
      let pointsEarned = 0;
      let pointsLost = 0;

      // Base points for completing a session
      if (duration >= 60) {
        pointsEarned += 10;  // full session bonus
      } else {
        pointsEarned += 5;   // short session
      }

      // Perfect drive bonus (zero distractions)
      if (distractionCount === 0) {
        pointsEarned += 15;
      }

      // Long drive bonus
      if (duration >= 300) {  // 5+ minutes
        pointsEarned += 10;
      }

      // Distraction penalty
      pointsLost += distractionCount * 5;

      const netPoints = pointsEarned - pointsLost;

      // ── CREATE SESSION OBJECT ─────────────────────────
      const session = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        timestamp: Date.now(),
        duration,
        durationFormatted: formatTime(duration),
        distractionCount,
        maxSpeed: Math.round(maxSpeed * 10) / 10,
        averageSpeed: Math.round(averageSpeed * 10) / 10,
        pointsEarned,
        pointsLost,
        netPoints,
        isPerfect: distractionCount === 0,
        wasAutoActivated,
      };

      // ── UPDATE SESSIONS LIST ──────────────────────────
      const updatedSessions = [session, ...sessions];
      setSessions(updatedSessions);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSIONS,
        JSON.stringify(updatedSessions)
      );

      // ── UPDATE SCORE ──────────────────────────────────
      const newScore = Math.min(100, Math.max(0, safetyScore + netPoints));
      setSafetyScore(newScore);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SCORE,
        JSON.stringify(newScore)
      );

      // ── UPDATE STREAK ─────────────────────────────────
      let newStreak = currentStreak;
      if (netPoints > 0) {
        newStreak += 1;
      } else {
        newStreak = 0;
      }
      setCurrentStreak(newStreak);
      await AsyncStorage.setItem(
        STORAGE_KEYS.STREAK,
        JSON.stringify(newStreak)
      );

      // ── CHECK ACHIEVEMENTS ────────────────────────────
      const stats = {
        totalSessions: updatedSessions.length,
        perfectSessions: updatedSessions.filter(s => s.isPerfect).length,
        currentStreak: newStreak,
        totalDriveMinutes: updatedSessions.reduce(
          (sum, s) => sum + s.duration / 60, 0
        ),
        safetyScore: newScore,
      };

      await checkAchievements(stats);

      // Update weekly stats
      calculateWeeklyStats(updatedSessions);

      return { session, netPoints, newScore };

    } catch (error) {
      console.log('Error saving session:', error);
    }
  }, [sessions, safetyScore, currentStreak]);

  // ── CHECK ACHIEVEMENTS ─────────────────────────────────
  const checkAchievements = async (stats) => {
    const unlockedIds = achievements.map(a => a.id);
    const newlyUnlocked = [];

    for (const achievement of ACHIEVEMENTS_LIST) {
      if (!unlockedIds.includes(achievement.id) &&
          achievement.condition(stats)) {
        newlyUnlocked.push({
          ...achievement,
          unlockedAt: new Date().toLocaleDateString(),
        });
      }
    }

    if (newlyUnlocked.length > 0) {
      const updatedAchievements = [...achievements, ...newlyUnlocked];
      setAchievements(updatedAchievements);
      await AsyncStorage.setItem(
        STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify(updatedAchievements)
      );

      // Show the first new achievement as a popup
      setNewAchievement(newlyUnlocked[0]);
      setTimeout(() => setNewAchievement(null), 4000);
    }
  };

  // ── CALCULATE WEEKLY STATS ─────────────────────────────
  const calculateWeeklyStats = (allSessions) => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekSessions = allSessions.filter(
      s => s.timestamp > oneWeekAgo
    );

    if (weekSessions.length === 0) {
      setWeeklyStats(null);
      return;
    }

    const totalDriveTime = weekSessions.reduce(
      (sum, s) => sum + s.duration, 0
    );
    const totalDistractions = weekSessions.reduce(
      (sum, s) => sum + s.distractionCount, 0
    );
    const perfectCount = weekSessions.filter(s => s.isPerfect).length;
    const avgSpeed = weekSessions.reduce(
      (sum, s) => sum + s.averageSpeed, 0
    ) / weekSessions.length;

    setWeeklyStats({
      sessions: weekSessions.length,
      totalDriveTime,
      totalDriveFormatted: formatTime(totalDriveTime),
      totalDistractions,
      perfectCount,
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      pointsEarned: weekSessions.reduce((sum, s) => sum + s.netPoints, 0),
    });
  };

  // ── RESET ALL DATA ─────────────────────────────────────
  const resetAllData = async () => {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      setSessions([]);
      setSafetyScore(100);
      setAchievements([]);
      setCurrentStreak(0);
      setWeeklyStats(null);
    } catch (error) {
      console.log('Error resetting data:', error);
    }
  };

  // ── GET MOCK LEADERBOARD ───────────────────────────────
  const getLeaderboard = () => {
    const myEntry = {
      name: 'You',
      score: safetyScore,
      sessions: sessions.length,
      isMe: true,
    };

    const mockFriends = [
      { name: 'Priya S.', score: 94, sessions: 12, isMe: false },
      { name: 'Rahul M.', score: 88, sessions: 8, isMe: false },
      { name: 'Ananya K.', score: 76, sessions: 5, isMe: false },
      { name: 'Vikram P.', score: 71, sessions: 15, isMe: false },
      { name: 'Meera R.', score: 65, sessions: 3, isMe: false },
    ];

    const allEntries = [...mockFriends, myEntry]
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return allEntries;
  };

  // Helper: format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return {
    sessions,
    safetyScore,
    achievements,
    newAchievement,
    weeklyStats,
    currentStreak,
    isLoading,
    saveSession,
    resetAllData,
    getLeaderboard,
    allAchievements: ACHIEVEMENTS_LIST,
  };
}