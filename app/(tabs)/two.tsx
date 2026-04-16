import React from 'react';
import {
  SafeAreaView, ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// two.tsx — Score Screen
// Shows driving safety score, session history and safety tips

export default function ScoreScreen() {

  // Hardcoded sample data for now
  // On Day 13 this connects to real session data
  const safetyScore = 85;
  const totalSessions = 3;
  const totalDriveTime = '12m 34s';
  const avgDistractions = 1.2;

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

  const tips = [
    { icon: '👀', tip: 'Keep your eyes on the road at all times' },
    { icon: '📵', tip: 'Never check your phone while driving' },
    { icon: '😴', tip: 'Take breaks on long drives — every 2 hours' },
    { icon: '🎵', tip: 'Set music before you start driving' },
    { icon: '🗺️', tip: 'Set navigation before driving, not while moving' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Safety Score</Text>
          <Text style={styles.subtitle}>Your driving safety overview</Text>
        </View>

        {/* Main score card */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>OVERALL SCORE</Text>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>
            {safetyScore}
          </Text>
          <Text style={styles.scoreMax}>/100</Text>

          {/* Score bar */}
          <View style={styles.scoreBarBg}>
            <View style={[
              styles.scoreBarFill,
              {
                width: `${safetyScore}%`,
                backgroundColor: scoreColor,
              }
            ]} />
          </View>

          <Text style={[styles.scoreTag, { color: scoreColor }]}>
            {getScoreLabel(safetyScore)}
          </Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalDriveTime}</Text>
            <Text style={styles.statLabel}>Drive Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[
              styles.statValue,
              { color: avgDistractions > 2 ? '#ff6b6b' : '#00ff87' }
            ]}>
              {avgDistractions}
            </Text>
            <Text style={styles.statLabel}>Avg Dist/min</Text>
          </View>
        </View>

        {/* Scoring rules */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 How Scoring Works</Text>
          <View style={styles.ruleRow}>
            <Text style={styles.ruleIcon}>✅</Text>
            <Text style={styles.ruleText}>Safe driving session completed</Text>
            <Text style={styles.rulePoints}>+10 pts</Text>
          </View>
          <View style={styles.ruleRow}>
            <Text style={styles.ruleIcon}>🎯</Text>
            <Text style={styles.ruleText}>5 safe sessions in a row</Text>
            <Text style={styles.rulePoints}>+25 pts</Text>
          </View>
          <View style={styles.ruleRow}>
            <Text style={styles.ruleIcon}>👀</Text>
            <Text style={styles.ruleText}>Zero distractions in session</Text>
            <Text style={styles.rulePoints}>+15 pts</Text>
          </View>
          <View style={styles.ruleRow}>
            <Text style={styles.ruleIcon}>❌</Text>
            <Text style={styles.ruleText}>Phone used while driving</Text>
            <Text style={[styles.rulePoints, { color: '#ff6b6b' }]}>-20 pts</Text>
          </View>
          <View style={styles.ruleRow}>
            <Text style={styles.ruleIcon}>😴</Text>
            <Text style={styles.ruleText}>Distraction detected</Text>
            <Text style={[styles.rulePoints, { color: '#ff6b6b' }]}>-5 pts</Text>
          </View>
        </View>

        {/* Safety tips */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 Safety Tips</Text>
          {tips.map((item, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipIcon}>{item.icon}</Text>
              <Text style={styles.tipText}>{item.tip}</Text>
            </View>
          ))}
        </View>

        {/* Coming soon */}
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>
            🏆 Full leaderboard and session history coming Day 13!
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1117' },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { paddingTop: 20, paddingBottom: 24, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#8892b0' },
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
    width: '100%', height: 8,
    backgroundColor: '#21262d', borderRadius: 4,
    overflow: 'hidden', marginBottom: 12,
  },
  scoreBarFill: { height: 8, borderRadius: 4 },
  scoreTag: { fontSize: 16, fontWeight: '600' },
  statsGrid: {
    flexDirection: 'row', gap: 12, marginBottom: 16,
  },
  statCard: {
    flex: 1, backgroundColor: '#161b22',
    borderRadius: 12, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#21262d',
  },
  statValue: {
    fontSize: 20, fontWeight: 'bold',
    color: '#ffffff', marginBottom: 4,
  },
  statLabel: { fontSize: 11, color: '#8892b0', textAlign: 'center' },
  card: {
    backgroundColor: '#161b22', borderRadius: 16,
    padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#21262d',
  },
  cardTitle: {
    fontSize: 12, color: '#8892b0',
    textTransform: 'uppercase', letterSpacing: 1.5,
    fontWeight: '600', marginBottom: 14,
  },
  ruleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#21262d',
  },
  ruleIcon: { fontSize: 18, marginRight: 12, width: 28 },
  ruleText: { flex: 1, fontSize: 13, color: '#c9d1d9' },
  rulePoints: { fontSize: 13, color: '#00ff87', fontWeight: '700' },
  tipRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#21262d',
  },
  tipIcon: { fontSize: 18, marginRight: 12, width: 28 },
  tipText: { flex: 1, fontSize: 13, color: '#8892b0', lineHeight: 20 },
  comingSoon: {
    backgroundColor: '#0d2b1e', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#00ff87',
    marginBottom: 16,
  },
  comingSoonText: { fontSize: 13, color: '#00ff87', textAlign: 'center' },
});