import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function ScoreScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <Text style={styles.icon}>🏆</Text>
        <Text style={styles.title}>Safety Score</Text>
        <Text style={styles.subtitle}>Full leaderboard coming Day 13</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>YOUR SCORE</Text>
          <Text style={styles.score}>100</Text>
          <Text style={styles.cardHint}>
            Complete driving sessions to earn points
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>HOW SCORING WORKS</Text>
          <Text style={styles.rule}>✅  +10 safe driving session</Text>
          <Text style={styles.rule}>❌  -20 phone used while driving</Text>
          <Text style={styles.rule}>🎯  +25 bonus for 5 safe sessions</Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1117' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  icon: { fontSize: 52, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#8892b0', marginBottom: 32 },
  card: { backgroundColor: '#161b22', borderRadius: 16, padding: 20, width: '100%', marginBottom: 16, borderWidth: 1, borderColor: '#21262d' },
  cardLabel: { fontSize: 11, color: '#8892b0', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  score: { fontSize: 64, fontWeight: 'bold', color: '#ffa657', textAlign: 'center', marginBottom: 8 },
  cardHint: { fontSize: 12, color: '#484f58', textAlign: 'center' },
  rule: { fontSize: 14, color: '#c9d1d9', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#21262d' },
});