import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const [driveModeActive, setDriveModeActive] = useState(false);

  const toggleDriveMode = () => {
    setDriveModeActive((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.header}>
          <Text style={styles.appName}>🚗 DriveZen</Text>
          <Text style={styles.appTagline}>AI Driving Safety</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.driveButton,
            driveModeActive ? styles.driveButtonActive : styles.driveButtonInactive,
          ]}
          onPress={toggleDriveMode}
          activeOpacity={0.8}
        >
          <Text style={styles.driveButtonIcon}>
            {driveModeActive ? '🛡️' : '🚗'}
          </Text>
          <Text style={styles.driveButtonText}>
            {driveModeActive ? 'DRIVE MODE ON' : 'DRIVE MODE OFF'}
          </Text>
          <Text style={styles.driveButtonSub}>
            {driveModeActive ? 'Tap to deactivate' : 'Tap to activate'}
          </Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Activity</Text>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusDot,
              driveModeActive ? styles.dotActive : styles.dotInactive
            ]} />
            <Text style={[
              styles.statusText,
              driveModeActive ? styles.statusTextActive : styles.statusTextInactive
            ]}>
              {driveModeActive ? 'DRIVING DETECTED' : 'NOT DRIVING'}
            </Text>
          </View>
          <Text style={styles.cardHint}>
            {driveModeActive
              ? 'Notifications blocked. Stay safe!'
              : 'Sensors will auto-detect when you start driving'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Speed</Text>
          <View style={styles.speedRow}>
            <Text style={styles.speedNumber}>0</Text>
            <Text style={styles.speedUnit}>km/h</Text>
          </View>
          <Text style={styles.cardHint}>
            Live GPS speed tracking coming Day 4
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Safety Score</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreNumber}>100</Text>
            <Text style={styles.scoreLabel}> / 100</Text>
          </View>
          <View style={styles.scoreBarBg}>
            <View style={[styles.scoreBarFill, { width: '100%' }]} />
          </View>
          <Text style={styles.cardHint}>
            +10 for safe sessions · -20 for phone use
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Features</Text>
          <FeatureRow icon="🤖" label="AI Activity Detection" active={false} day={6} />
          <FeatureRow icon="📵" label="Message Blocking" active={driveModeActive} day={10} />
          <FeatureRow icon="👁️" label="Attention Monitoring" active={false} day={12} />
          <FeatureRow icon="🏆" label="Score Tracking" active={true} day={13} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureRow({ icon, label, active, day }: {
  icon: string;
  label: string;
  active: boolean;
  day: number;
}) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureLabel}>{label}</Text>
      <View style={[
        styles.featureBadge,
        active ? styles.badgeActive : styles.badgeInactive
      ]}>
        <Text style={[
          styles.featureBadgeText,
          active ? styles.badgeTextActive : styles.badgeTextInactive
        ]}>
          {active ? 'ON' : `Day ${day}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1117' },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { paddingTop: 20, paddingBottom: 24, alignItems: 'center' },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  appTagline: { fontSize: 13, color: '#8892b0', letterSpacing: 2 },
  driveButton: { borderRadius: 20, paddingVertical: 32, alignItems: 'center', marginBottom: 20, borderWidth: 2 },
  driveButtonActive: { backgroundColor: '#0d2b1e', borderColor: '#00ff87' },
  driveButtonInactive: { backgroundColor: '#161b22', borderColor: '#30363d' },
  driveButtonIcon: { fontSize: 48, marginBottom: 12 },
  driveButtonText: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 6 },
  driveButtonSub: { fontSize: 13, color: '#8892b0' },
  card: { backgroundColor: '#161b22', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#21262d' },
  cardTitle: { fontSize: 12, color: '#8892b0', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14, fontWeight: '600' },
  cardHint: { fontSize: 12, color: '#484f58', marginTop: 10, lineHeight: 18 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  dotActive: { backgroundColor: '#00ff87' },
  dotInactive: { backgroundColor: '#484f58' },
  statusText: { fontSize: 18, fontWeight: 'bold' },
  statusTextActive: { color: '#00ff87' },
  statusTextInactive: { color: '#484f58' },
  speedRow: { flexDirection: 'row', alignItems: 'flex-end' },
  speedNumber: { fontSize: 52, fontWeight: 'bold', color: '#58a6ff', lineHeight: 56 },
  speedUnit: { fontSize: 18, color: '#8892b0', marginBottom: 8, marginLeft: 8 },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  scoreNumber: { fontSize: 52, fontWeight: 'bold', color: '#ffa657', lineHeight: 56 },
  scoreLabel: { fontSize: 18, color: '#8892b0', marginBottom: 8 },
  scoreBarBg: { height: 6, backgroundColor: '#21262d', borderRadius: 3, overflow: 'hidden' },
  scoreBarFill: { height: 6, backgroundColor: '#ffa657', borderRadius: 3 },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#21262d' },
  featureIcon: { fontSize: 20, marginRight: 12, width: 28 },
  featureLabel: { flex: 1, fontSize: 14, color: '#c9d1d9' },
  featureBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeActive: { backgroundColor: '#0d2b1e', borderWidth: 1, borderColor: '#00ff87' },
  badgeInactive: { backgroundColor: '#161b22', borderWidth: 1, borderColor: '#30363d' },
  featureBadgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextActive: { color: '#00ff87' },
  badgeTextInactive: { color: '#484f58' },
});