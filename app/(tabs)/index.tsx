import { Accelerometer, Gyroscope } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import ActivityCard from '../../frontend/components/ActivityCard';
import DriveModeButton from '../../frontend/components/DriveModeButton';
import SensorCard from '../../frontend/components/SensorCard';
import SpeedCard from '../../frontend/components/SpeedCard';
import useDriveDetection from '../../frontend/hooks/useDriveDetection';
import useLocation from '../../frontend/hooks/useLocation';
import useMLPrediction from '../../frontend/hooks/useMLPrediction';

// index.tsx — Day 9: Auto Drive Mode
//
// Today the app fully drives itself (pun intended).
// No user interaction needed — the app detects driving
// automatically and activates Drive Mode on its own.
//
// New hook: useDriveDetection
// Takes ML prediction + speed → outputs driveModeActive automatically

export default function HomeScreen() {
  const [sensorsEnabled, setSensorsEnabled] = useState(true);
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
  const accelSub = useRef(null);
  const gyroSub = useRef(null);

  // ── GPS ───────────────────────────────────────────────
  const { speed, permissionStatus, isTracking } = useLocation();

  // ── ML PREDICTION ─────────────────────────────────────
  const {
    prediction,
    isConnected,
    isLoading,
    error: apiError,
    predictionCount,
  } = useMLPrediction(accelData, gyroData, speed);

  // ── AUTO DRIVE DETECTION ──────────────────────────────
  // This is the new hook today!
  // It watches prediction + speed and automatically
  // activates/deactivates Drive Mode
  const {
    driveModeActive,
    toggleDriveMode,
    driveSessionSeconds,
    driveSessionFormatted,
    detectionState,
    completedSessions,
  } = useDriveDetection(prediction, speed);

  // ── SENSORS ───────────────────────────────────────────
  const startSensors = () => {
    Accelerometer.setUpdateInterval(200);
    Gyroscope.setUpdateInterval(200);
    accelSub.current = Accelerometer.addListener(setAccelData);
    gyroSub.current = Gyroscope.addListener(setGyroData);
  };

  const stopSensors = () => {
    accelSub.current?.remove();
    gyroSub.current?.remove();
    accelSub.current = null;
    gyroSub.current = null;
  };

  useEffect(() => {
    startSensors();
    return () => stopSensors();
  }, []);

  const handleSensorToggle = (value) => {
    setSensorsEnabled(value);
    value ? startSensors() : stopSensors();
    if (!value) {
      setAccelData({ x: 0, y: 0, z: 0 });
      setGyroData({ x: 0, y: 0, z: 0 });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <Text style={styles.appName}>🚗 DriveZen</Text>
          <Text style={styles.appTagline}>AI Driving Safety</Text>
        </View>

        {/* ── CONNECTION WARNING ── */}
        {!isConnected && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️  Backend not connected — run python app.py on your PC
            </Text>
          </View>
        )}

        {/* ── DRIVE MODE BUTTON ── */}
        {/* Now uses the smart DriveModeButton component */}
        <DriveModeButton
          driveModeActive={driveModeActive}
          onPress={toggleDriveMode}
          detectionState={detectionState}
          sessionTime={driveSessionFormatted}
          speed={speed}
          activity={prediction.activity}
        />

        {/* ── SESSION INFO ── */}
        {driveModeActive && (
          <View style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>🏁 Current Session</Text>
            <View style={styles.sessionRow}>
              <View style={styles.sessionStat}>
                <Text style={styles.sessionValue}>{driveSessionFormatted}</Text>
                <Text style={styles.sessionLabel}>Duration</Text>
              </View>
              <View style={styles.sessionDivider} />
              <View style={styles.sessionStat}>
                <Text style={styles.sessionValue}>
                  {speed.toFixed(1)}
                </Text>
                <Text style={styles.sessionLabel}>km/h</Text>
              </View>
              <View style={styles.sessionDivider} />
              <View style={styles.sessionStat}>
                <Text style={styles.sessionValue}>
                  {(prediction.confidence * 100).toFixed(0)}%
                </Text>
                <Text style={styles.sessionLabel}>Confidence</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── COMPLETED SESSIONS ── */}
        {completedSessions.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent Sessions</Text>
            {completedSessions.slice(0, 3).map((session, i) => (
              <View key={i} style={styles.sessionHistoryRow}>
                <Text style={styles.sessionHistoryIcon}>🚗</Text>
                <Text style={styles.sessionHistoryTime}>{session.date}</Text>
                <Text style={styles.sessionHistoryDuration}>
                  {Math.floor(session.duration / 60)}m {session.duration % 60}s
                </Text>
                <Text style={styles.sessionHistoryScore}>
                  +{session.score} pts
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── ML ACTIVITY CARD ── */}
        <ActivityCard
          activity={prediction.activity}
          confidence={prediction.confidence}
          allProbs={prediction.all_probabilities}
          isConnected={isConnected}
          isLoading={isLoading}
          error={apiError}
          predictionCount={predictionCount}
        />

        {/* ── GPS SPEED ── */}
        <SpeedCard
          speed={speed}
          isTracking={isTracking}
          permissionStatus={permissionStatus}
        />

        {/* ── DETECTION DEBUG INFO ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔍 Detection Status</Text>
          <View style={styles.debugRow}>
            <Text style={styles.debugLabel}>State</Text>
            <Text style={[styles.debugValue, {
              color: detectionState === 'DRIVING' ? '#00ff87' :
                     detectionState === 'CONFIRMING' ? '#ffa657' : '#8892b0'
            }]}>
              {detectionState}
            </Text>
          </View>
          <View style={styles.debugRow}>
            <Text style={styles.debugLabel}>ML Activity</Text>
            <Text style={styles.debugValue}>{prediction.activity}</Text>
          </View>
          <View style={styles.debugRow}>
            <Text style={styles.debugLabel}>ML Confidence</Text>
            <Text style={styles.debugValue}>
              {(prediction.confidence * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.debugRow}>
            <Text style={styles.debugLabel}>GPS Speed</Text>
            <Text style={styles.debugValue}>{speed.toFixed(1)} km/h</Text>
          </View>
          <View style={styles.debugRow}>
            <Text style={styles.debugLabel}>API Predictions</Text>
            <Text style={styles.debugValue}>{predictionCount}</Text>
          </View>
          <Text style={styles.cardHint}>
            Requires ML=driving (70%+) AND speed≥15 km/h for 6+ seconds to activate
          </Text>
        </View>

        {/* ── SENSOR TOGGLE ── */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>📡  Live Sensor Reading</Text>
            <Switch
              value={sensorsEnabled}
              onValueChange={handleSensorToggle}
              trackColor={{ false: '#21262d', true: '#0d2b1e' }}
              thumbColor={sensorsEnabled ? '#00ff87' : '#484f58'}
            />
          </View>
        </View>

        {/* ── SENSOR CARDS ── */}
        <SensorCard
          title="Accelerometer" icon="📱"
          data={accelData} color="#58a6ff"
        />
        <SensorCard
          title="Gyroscope" icon="🔄"
          data={gyroData} color="#bc8cff"
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1117' },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { paddingTop: 20, paddingBottom: 20, alignItems: 'center' },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  appTagline: { fontSize: 13, color: '#8892b0', letterSpacing: 2 },
  warningBanner: {
    backgroundColor: '#2d1f0a', borderRadius: 10,
    padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#ffa657',
  },
  warningText: { fontSize: 12, color: '#ffa657', textAlign: 'center' },
  sessionCard: {
    backgroundColor: '#0d2b1e', borderRadius: 16,
    padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#00ff87',
  },
  sessionTitle: {
    fontSize: 12, color: '#00ff87', textTransform: 'uppercase',
    letterSpacing: 1.5, fontWeight: '600', marginBottom: 14,
  },
  sessionRow: { flexDirection: 'row', alignItems: 'center' },
  sessionStat: { flex: 1, alignItems: 'center' },
  sessionValue: {
    fontSize: 28, fontWeight: 'bold', color: '#ffffff',
    fontVariant: ['tabular-nums'],
  },
  sessionLabel: { fontSize: 11, color: '#8892b0', marginTop: 4 },
  sessionDivider: { width: 1, height: 40, backgroundColor: '#21262d' },
  card: {
    backgroundColor: '#161b22', borderRadius: 16,
    padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#21262d',
  },
  cardTitle: {
    fontSize: 12, color: '#8892b0', textTransform: 'uppercase',
    letterSpacing: 1.5, marginBottom: 14, fontWeight: '600',
  },
  cardHint: { fontSize: 12, color: '#484f58', marginTop: 10, lineHeight: 18 },
  sessionHistoryRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#21262d',
  },
  sessionHistoryIcon: { fontSize: 18, marginRight: 10 },
  sessionHistoryTime: { flex: 1, fontSize: 13, color: '#8892b0' },
  sessionHistoryDuration: { fontSize: 13, color: '#c9d1d9', marginRight: 12 },
  sessionHistoryScore: { fontSize: 13, color: '#00ff87', fontWeight: '600' },
  debugRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#21262d',
  },
  debugLabel: { fontSize: 13, color: '#8892b0' },
  debugValue: { fontSize: 13, color: '#c9d1d9', fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: 14, color: '#c9d1d9', fontWeight: '600' },
});