import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import useScore from '../../frontend/hooks/useScore';

// two.tsx — Full Score Screen
//
// Tabs:
//   SCORE      → safety score + weekly stats
//   SESSIONS   → full session history
//   ACHIEVEMENTS → unlocked badges
//   LEADERBOARD → friends ranking

export default function ScoreScreen() {

  const [activeTab, setActiveTab] = useState('SCORE');

  const {
    sessions,
    safetyScore,
    achievements,
    weeklyStats,
    currentStreak,
    isLoading,
    resetAllData,
    getLeaderboard,
    allAchievements,
  } = useScore();

  const leaderboard = getLeaderboard();

  // Score color
  const getScoreColor = (score) => {
    if (score >= 80) return '#00ff87';
    if (score >= 60) return '#ffa657';
    return '#ff6b6b';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent Driver 🏆';
    if (score >= 80) return 'Safe Driver ✅';
    if (score >= 60) return 'Needs Improvement ⚠️';
    return 'Unsafe — Please focus 🚨';
  };

  const scoreColor = getScoreColor(safetyScore);

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all sessions, scores and achievements. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetAllData,
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading scores...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── TAB BAR ── */}
      <View style={styles.tabBar}>
        {['SCORE', 'SESSIONS', 'ACHIEVEMENTS', 'LEADERBOARD'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.tabTextActive
            ]}>
              {tab === 'SCORE' ? '📊' :
               tab === 'SESSIONS' ? '🚗' :
               tab === 'ACHIEVEMENTS' ? '🏅' : '🏆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ════════════ SCORE TAB ════════════ */}
        {activeTab === 'SCORE' && (
          <>
            {/* Main score */}
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>SAFETY SCORE</Text>
              <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                {safetyScore}
              </Text>
              <Text style={styles.scoreMax}>/100</Text>
              <View style={styles.scoreBarBg}>
                <View style={[
                  styles.scoreBarFill,
                  { width: `${safetyScore}%`, backgroundColor: scoreColor }
                ]} />
              </View>
              <Text style={[styles.scoreTag, { color: scoreColor }]}>
                {getScoreLabel(safetyScore)}
              </Text>
            </View>

            {/* Quick stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{sessions.length}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: '#ffa657' }]}>
                  {currentStreak}🔥
                </Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{achievements.length}</Text>
                <Text style={styles.statLabel}>Badges</Text>
              </View>
            </View>

            {/* Weekly stats */}
            {weeklyStats ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>📅 This Week</Text>
                <View style={styles.weekRow}>
                  <View style={styles.weekStat}>
                    <Text style={styles.weekValue}>{weeklyStats.sessions}</Text>
                    <Text style={styles.weekLabel}>Drives</Text>
                  </View>
                  <View style={styles.weekStat}>
                    <Text style={styles.weekValue}>
                      {weeklyStats.totalDriveFormatted}
                    </Text>
                    <Text style={styles.weekLabel}>Drive time</Text>
                  </View>
                  <View style={styles.weekStat}>
                    <Text style={[
                      styles.weekValue,
                      { color: weeklyStats.totalDistractions > 5 ? '#ff6b6b' : '#00ff87' }
                    ]}>
                      {weeklyStats.totalDistractions}
                    </Text>
                    <Text style={styles.weekLabel}>Distractions</Text>
                  </View>
                  <View style={styles.weekStat}>
                    <Text style={[styles.weekValue, { color: '#ffa657' }]}>
                      +{weeklyStats.pointsEarned}
                    </Text>
                    <Text style={styles.weekLabel}>Points</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📅</Text>
                <Text style={styles.emptyText}>
                  Complete a drive to see weekly stats
                </Text>
              </View>
            )}

            {/* Scoring rules */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📊 Scoring Rules</Text>
              {[
                { icon: '✅', text: 'Complete a session (60s+)', pts: '+10' },
                { icon: '👀', text: 'Zero distractions in session', pts: '+15' },
                { icon: '⏱️', text: 'Drive 5+ minutes', pts: '+10' },
                { icon: '🔥', text: '3 safe sessions streak', pts: '+25' },
                { icon: '😴', text: 'Each distraction detected', pts: '-5' },
              ].map((rule, i) => (
                <View key={i} style={styles.ruleRow}>
                  <Text style={styles.ruleIcon}>{rule.icon}</Text>
                  <Text style={styles.ruleText}>{rule.text}</Text>
                  <Text style={[
                    styles.rulePts,
                    { color: rule.pts.startsWith('+') ? '#00ff87' : '#ff6b6b' }
                  ]}>
                    {rule.pts}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>🗑️ Reset All Data</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ════════════ SESSIONS TAB ════════════ */}
        {activeTab === 'SESSIONS' && (
          <>
            <Text style={styles.sectionHeader}>
              {sessions.length} Total Sessions
            </Text>

            {sessions.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🚗</Text>
                <Text style={styles.emptyText}>
                  No sessions yet!{'\n'}Start Drive Mode to record your first drive.
                </Text>
              </View>
            ) : (
              sessions.map((session) => (
                <View key={session.id} style={styles.sessionCard}>
                  <View style={styles.sessionHeader}>
                    <View>
                      <Text style={styles.sessionDate}>{session.date}</Text>
                      <Text style={styles.sessionTime}>{session.time}</Text>
                    </View>
                    <View style={[
                      styles.pointsBadge,
                      { backgroundColor: session.netPoints >= 0 ? '#0d2b1e' : '#2d0d0d' }
                    ]}>
                      <Text style={[
                        styles.pointsText,
                        { color: session.netPoints >= 0 ? '#00ff87' : '#ff6b6b' }
                      ]}>
                        {session.netPoints >= 0 ? '+' : ''}{session.netPoints} pts
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sessionStats}>
                    <View style={styles.sessionStat}>
                      <Text style={styles.sessionStatValue}>
                        {session.durationFormatted}
                      </Text>
                      <Text style={styles.sessionStatLabel}>Duration</Text>
                    </View>
                    <View style={styles.sessionStat}>
                      <Text style={[
                        styles.sessionStatValue,
                        { color: session.distractionCount > 0 ? '#ff6b6b' : '#00ff87' }
                      ]}>
                        {session.distractionCount}
                      </Text>
                      <Text style={styles.sessionStatLabel}>Distractions</Text>
                    </View>
                    <View style={styles.sessionStat}>
                      <Text style={styles.sessionStatValue}>
                        {session.maxSpeed} km/h
                      </Text>
                      <Text style={styles.sessionStatLabel}>Max speed</Text>
                    </View>
                  </View>

                  {session.isPerfect && (
                    <View style={styles.perfectBadge}>
                      <Text style={styles.perfectText}>
                        ✨ Perfect Drive — Zero Distractions!
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </>
        )}

        {/* ════════════ ACHIEVEMENTS TAB ════════════ */}
        {activeTab === 'ACHIEVEMENTS' && (
          <>
            <Text style={styles.sectionHeader}>
              {achievements.length}/{allAchievements.length} Unlocked
            </Text>

            {allAchievements.map((achievement) => {
              const isUnlocked = achievements.some(a => a.id === achievement.id);
              const unlockedData = achievements.find(a => a.id === achievement.id);

              return (
                <View key={achievement.id} style={[
                  styles.achievementCard,
                  isUnlocked ? styles.achievementUnlocked : styles.achievementLocked
                ]}>
                  <Text style={[
                    styles.achievementIcon,
                    !isUnlocked && styles.achievementIconLocked
                  ]}>
                    {isUnlocked ? achievement.icon : '🔒'}
                  </Text>
                  <View style={styles.achievementInfo}>
                    <Text style={[
                      styles.achievementTitle,
                      !isUnlocked && styles.achievementTitleLocked
                    ]}>
                      {achievement.title}
                    </Text>
                    <Text style={styles.achievementDesc}>
                      {achievement.description}
                    </Text>
                    {isUnlocked && unlockedData && (
                      <Text style={styles.achievementDate}>
                        Unlocked {unlockedData.unlockedAt}
                      </Text>
                    )}
                  </View>
                  <View style={[
                    styles.achievementPoints,
                    isUnlocked ? styles.achievementPointsOn : styles.achievementPointsOff
                  ]}>
                    <Text style={[
                      styles.achievementPts,
                      { color: isUnlocked ? '#ffa657' : '#484f58' }
                    ]}>
                      +{achievement.points}
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* ════════════ LEADERBOARD TAB ════════════ */}
        {activeTab === 'LEADERBOARD' && (
          <>
            <Text style={styles.sectionHeader}>Safety Rankings</Text>

            {leaderboard.map((entry) => (
              <View key={entry.name} style={[
                styles.leaderRow,
                entry.isMe && styles.leaderRowMe
              ]}>
                {/* Rank */}
                <View style={[
                  styles.rankBadge,
                  entry.rank === 1 ? styles.rank1 :
                  entry.rank === 2 ? styles.rank2 :
                  entry.rank === 3 ? styles.rank3 : styles.rankOther
                ]}>
                  <Text style={styles.rankText}>
                    {entry.rank === 1 ? '🥇' :
                     entry.rank === 2 ? '🥈' :
                     entry.rank === 3 ? '🥉' :
                     `#${entry.rank}`}
                  </Text>
                </View>

                {/* Name */}
                <View style={styles.leaderInfo}>
                  <Text style={[
                    styles.leaderName,
                    entry.isMe && { color: '#00ff87' }
                  ]}>
                    {entry.name} {entry.isMe ? '← You' : ''}
                  </Text>
                  <Text style={styles.leaderSessions}>
                    {entry.sessions} sessions
                  </Text>
                </View>

                {/* Score */}
                <Text style={[
                  styles.leaderScore,
                  { color: getScoreColor(entry.score) }
                ]}>
                  {entry.score}
                </Text>
              </View>
            ))}

            <View style={styles.leaderNote}>
              <Text style={styles.leaderNoteText}>
                🌐 Invite friends to compete on the leaderboard!
              </Text>
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1117' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#8892b0', fontSize: 16 },
  tabBar: {
    flexDirection: 'row', backgroundColor: '#161b22',
    borderBottomWidth: 1, borderBottomColor: '#21262d',
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#00ff87' },
  tabText: { fontSize: 18 },
  tabTextActive: { },
  scroll: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 16 },
  sectionHeader: {
    fontSize: 14, color: '#8892b0',
    marginBottom: 16, fontWeight: '600',
  },
  // Score card
  scoreCard: {
    backgroundColor: '#161b22', borderRadius: 16,
    padding: 24, marginBottom: 16, borderWidth: 1,
    borderColor: '#21262d', alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 11, color: '#8892b0',
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8,
  },
  scoreNumber: { fontSize: 80, fontWeight: 'bold', lineHeight: 88 },
  scoreMax: { fontSize: 20, color: '#8892b0', marginBottom: 16 },
  scoreBarBg: {
    width: '100%', height: 8, backgroundColor: '#21262d',
    borderRadius: 4, overflow: 'hidden', marginBottom: 12,
  },
  scoreBarFill: { height: 8, borderRadius: 4 },
  scoreTag: { fontSize: 16, fontWeight: '600' },
  // Stats
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#161b22', borderRadius: 12,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#21262d',
  },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#8892b0', textAlign: 'center' },
  // Weekly
  card: {
    backgroundColor: '#161b22', borderRadius: 16,
    padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#21262d',
  },
  cardTitle: {
    fontSize: 12, color: '#8892b0', textTransform: 'uppercase',
    letterSpacing: 1.5, fontWeight: '600', marginBottom: 14,
  },
  weekRow: { flexDirection: 'row' },
  weekStat: { flex: 1, alignItems: 'center' },
  weekValue: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  weekLabel: { fontSize: 11, color: '#8892b0', textAlign: 'center' },
  // Rules
  ruleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#21262d',
  },
  ruleIcon: { fontSize: 18, marginRight: 12, width: 28 },
  ruleText: { flex: 1, fontSize: 13, color: '#c9d1d9' },
  rulePts: { fontSize: 13, fontWeight: '700' },
  resetBtn: {
    backgroundColor: '#2d0d0d', borderRadius: 12,
    padding: 14, alignItems: 'center', borderWidth: 1,
    borderColor: '#ff6b6b', marginBottom: 16,
  },
  resetBtnText: { fontSize: 14, color: '#ff6b6b' },
  // Empty state
  emptyCard: {
    backgroundColor: '#161b22', borderRadius: 16,
    padding: 40, alignItems: 'center', borderWidth: 1,
    borderColor: '#21262d', marginBottom: 16,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 14, color: '#484f58', textAlign: 'center', lineHeight: 22 },
  // Sessions
  sessionCard: {
    backgroundColor: '#161b22', borderRadius: 16,
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#21262d',
  },
  sessionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12,
  },
  sessionDate: { fontSize: 14, color: '#c9d1d9', fontWeight: '600' },
  sessionTime: { fontSize: 12, color: '#484f58', marginTop: 2 },
  pointsBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pointsText: { fontSize: 13, fontWeight: '700' },
  sessionStats: { flexDirection: 'row' },
  sessionStat: { flex: 1, alignItems: 'center' },
  sessionStatValue: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', marginBottom: 2 },
  sessionStatLabel: { fontSize: 10, color: '#8892b0' },
  perfectBadge: {
    backgroundColor: '#0d2b1e', borderRadius: 8,
    padding: 8, marginTop: 10, borderWidth: 1, borderColor: '#00ff87',
  },
  perfectText: { fontSize: 12, color: '#00ff87', textAlign: 'center' },
  // Achievements
  achievementCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1,
  },
  achievementUnlocked: {
    backgroundColor: '#161b22', borderColor: '#ffa657',
  },
  achievementLocked: {
    backgroundColor: '#0d1117', borderColor: '#21262d',
  },
  achievementIcon: { fontSize: 36, marginRight: 14 },
  achievementIconLocked: { opacity: 0.3 },
  achievementInfo: { flex: 1 },
  achievementTitle: {
    fontSize: 15, color: '#ffffff', fontWeight: '600', marginBottom: 4,
  },
  achievementTitleLocked: { color: '#484f58' },
  achievementDesc: { fontSize: 12, color: '#8892b0', lineHeight: 18 },
  achievementDate: { fontSize: 11, color: '#484f58', marginTop: 4 },
  achievementPoints: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1,
  },
  achievementPointsOn: { backgroundColor: '#1c1a0e', borderColor: '#ffa657' },
  achievementPointsOff: { backgroundColor: '#0d1117', borderColor: '#21262d' },
  achievementPts: { fontSize: 13, fontWeight: '700' },
  // Leaderboard
  leaderRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#161b22', borderRadius: 16,
    padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#21262d',
  },
  leaderRowMe: { borderColor: '#00ff87', backgroundColor: '#0a1f15' },
  rankBadge: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  rank1: { backgroundColor: '#2d2506' },
  rank2: { backgroundColor: '#1a1f2d' },
  rank3: { backgroundColor: '#1f1209' },
  rankOther: { backgroundColor: '#161b22', borderWidth: 1, borderColor: '#21262d' },
  rankText: { fontSize: 20 },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: 15, color: '#ffffff', fontWeight: '600', marginBottom: 2 },
  leaderSessions: { fontSize: 12, color: '#484f58' },
  leaderScore: { fontSize: 28, fontWeight: 'bold' },
  leaderNote: {
    backgroundColor: '#161b22', borderRadius: 12,
    padding: 14, marginTop: 4, borderWidth: 1, borderColor: '#21262d',
  },
  leaderNoteText: { fontSize: 13, color: '#484f58', textAlign: 'center' },
});