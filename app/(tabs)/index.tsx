import { Accelerometer, Gyroscope } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';
import ActivityCard from '../../frontend/components/ActivityCard';
import CameraMonitor from '../../frontend/components/CameraMonitor';
import DriveModeButton from '../../frontend/components/DriveModeButton';
import MessageBlocker from '../../frontend/components/MessageBlocker';
import SensorCard from '../../frontend/components/SensorCard';
import SpeedCard from '../../frontend/components/SpeedCard';
import useAttention from '../../frontend/hooks/useAttention';
import useAutoReply from '../../frontend/hooks/useAutoReply';
import useDriveDetection from '../../frontend/hooks/useDriveDetection';
import useLocation from '../../frontend/hooks/useLocation';
import useMLPrediction from '../../frontend/hooks/useMLPrediction';
import useScore from '../../frontend/hooks/useScore';

export default function HomeScreen() {
  const [sensorsEnabled, setSensorsEnabled] = useState(true);
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
  const accelSub = useRef(null);
  const gyroSub = useRef(null);

  // Track session data for scoring
  const speedHistory = useRef([]);
  const prevDriveMode = useRef(false);

  const { speed, permissionStatus, isTracking } = useLocation();

  const {
    prediction, isConnected, isLoading,
    error: apiError, predictionCount,
  } = useMLPrediction(accelData, gyroData, speed);

  const {
    driveModeActive, toggleDriveMode,
    driveSessionSeconds, driveSessionFormatted,
    detectionState, completedSessions,
  } = useDriveDetection(prediction, speed);

  const {
    blockedMessages, blockedCount,
    autoReplyEnabled, setAutoReplyEnabled,
    replyMessage, setReplyMessage,
    smsAvailable, sendSMSReply,
    clearBlockedMessages,
  } = useAutoReply(driveModeActive);

  const {
    isDistracted, distractionReason, distractionCount,
    showWarning, warningLevel, dismissWarning,
    attentionData, analyzeFrame,
    distractionHistory, distractionRate, clearHistory,
  } = useAttention(driveModeActive);

  // ── SCORE SYSTEM ──────────────────────────────────────
  const {
    safetyScore, saveSession,
    newAchievement,
  } = useScore();

  // ── TRACK SPEED FOR SESSION STATS ─────────────────────
  useEffect(() => {
    if (driveModeActive && speed > 0) {
      speedHistory.current.push(speed);
    }
  }, [speed, driveModeActive]);

  // ── SAVE SESSION WHEN DRIVE MODE TURNS OFF ─────────────
  useEffect(() => {
    if (prevDriveMode.current && !driveModeActive) {
      // Drive Mode just turned OFF — save the session
      if (driveSessionSeconds > 10) {
        const speeds = speedHistory.current;
        const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
        const avgSpeed = speeds.length > 0
          ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;

        saveSession({
          duration: driveSessionSeconds,
          distractionCount,
          maxSpeed,
          averageSpeed: avgSpeed,
          wasAutoActivated: detectionState === 'DRIVING',
        });

        // Reset speed history for next session
        speedHistory.current = [];
      }
    }
    prevDriveMode.current = driveModeActive;
  }, [driveModeActive]);

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

      {/* ── ACHIEVEMENT POPUP ── */}
      <Modal visible={!!newAchievement} transparent animationType="slide">
        <View style={styles.achievementOverlay}>
          <View style={styles.achievementPopup}>
            <Text style={styles.achievementBadge}>🎉</Text>
            <Text style={styles.achievementTitle}>Achievement Unlocked!</Text>
            <Text style={styles.achievementIcon}>
              {newAchievement?.icon}
            </Text>
            <Text style={styles.achievementName}>
              {newAchievement?.title}
            </Text>
            <Text style={styles.achievementDesc}>
              {newAchievement?.description}
            </Text>
            <Text style={styles.achievementPts}>
              +{newAchievement?.points} bonus points!
            </Text>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.header}>
          <Text style={styles.appName}>🚗 DriveZen</Text>
          <Text style={styles.appTagline}>AI Driving Safety</Text>
          {/* Score badge in header */}
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>⭐ {safetyScore}</Text>
          </View>
        </View>

        {!isConnected && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️  Backend not connected — run python app.py on your PC
            </Text>
          </View>
        )}

        <DriveModeButton
          driveModeActive={driveModeActive}
          onPress={toggleDriveMode}
          detectionState={detectionState}
          sessionTime={driveSessionFormatted}
          speed={speed}
          activity={prediction.activity}
        />

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
                <Text style={styles.sessionValue}>{speed.toFixed(1)}</Text>
                <Text style={styles.sessionLabel}>km/h</Text>
              </View>
              <View style={styles.sessionDivider} />
              <View style={styles.sessionStat}>
                <Text style={[
                  styles.sessionValue,
                  { color: isDistracted ? '#ff6b6b' : '#00ff87' }
                ]}>
                  {distractionCount}
                </Text>
                <Text style={styles.sessionLabel}>Distractions</Text>
              </View>
            </View>
          </View>
        )}

        <CameraMonitor
          driveModeActive={driveModeActive}
          isDistracted={isDistracted}
          distractionReason={distractionReason}
          distractionCount={distractionCount}
          warningLevel={warningLevel}
          showWarning={showWarning}
          dismissWarning={dismissWarning}
          attentionData={attentionData}
          analyzeFrame={analyzeFrame}
          distractionHistory={distractionHistory}
          distractionRate={distractionRate}
          clearHistory={clearHistory}
        />

        <MessageBlocker
          driveModeActive={driveModeActive}
          blockedMessages={blockedMessages}
          blockedCount={blockedCount}
          autoReplyEnabled={autoReplyEnabled}
          setAutoReplyEnabled={setAutoReplyEnabled}
          replyMessage={replyMessage}
          setReplyMessage={setReplyMessage}
          clearMessages={clearBlockedMessages}
          smsAvailable={smsAvailable}
        />

        <ActivityCard
          activity={prediction.activity}
          confidence={prediction.confidence}
          allProbs={prediction.all_probabilities}
          isConnected={isConnected}
          isLoading={isLoading}
          error={apiError}
          predictionCount={predictionCount}
        />

        <SpeedCard
          speed={speed}
          isTracking={isTracking}
          permissionStatus={permissionStatus}
        />

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

        <SensorCard title="Accelerometer" icon="📱" data={accelData} color="#58a6ff" />
        <SensorCard title="Gyroscope" icon="🔄" data={gyroData} color="#bc8cff" />

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
  scoreBadge: {
    backgroundColor: '#1c1a0e', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5,
    marginTop: 8, borderWidth: 1, borderColor: '#ffa657',
  },
  scoreBadgeText: { fontSize: 13, color: '#ffa657', fontWeight: '600' },
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
    fontSize: 28, fontWeight: 'bold',
    color: '#ffffff', fontVariant: ['tabular-nums'],
  },
  sessionLabel: { fontSize: 11, color: '#8892b0', marginTop: 4 },
  sessionDivider: { width: 1, height: 40, backgroundColor: '#21262d' },
  card: {
    backgroundColor: '#161b22', borderRadius: 16,
    padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#21262d',
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: 14, color: '#c9d1d9', fontWeight: '600' },
  // Achievement popup
  achievementOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end', padding: 20,
  },
  achievementPopup: {
    backgroundColor: '#1c1a0e', borderRadius: 20,
    padding: 24, alignItems: 'center',
    borderWidth: 2, borderColor: '#ffa657',
  },
  achievementBadge: { fontSize: 32, marginBottom: 8 },
  achievementTitle: {
    fontSize: 14, color: '#ffa657',
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12,
  },
  achievementIcon: { fontSize: 48, marginBottom: 8 },
  achievementName: {
    fontSize: 22, color: '#ffffff',
    fontWeight: 'bold', marginBottom: 8,
  },
  achievementDesc: {
    fontSize: 14, color: '#8892b0',
    textAlign: 'center', marginBottom: 12,
  },
  achievementPts: {
    fontSize: 18, color: '#ffa657', fontWeight: '700',
  },
});