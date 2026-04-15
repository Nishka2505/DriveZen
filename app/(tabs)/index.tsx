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

export default function HomeScreen() {
  const [sensorsEnabled, setSensorsEnabled] = useState(true);
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
  const accelSub = useRef(null);
  const gyroSub = useRef(null);

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

  // ── ATTENTION MONITORING (NEW TODAY) ─────────────────
  const {
    isDistracted,
    distractionReason,
    distractionCount,
    showWarning,
    dismissWarning,
    attentionData,
    analyzeFrame,
  } = useAttention(driveModeActive);

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

        <View style={styles.header}>
          <Text style={styles.appName}>🚗 DriveZen</Text>
          <Text style={styles.appTagline}>AI Driving Safety</Text>
          {driveModeActive && blockedCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{blockedCount} blocked</Text>
            </View>
          )}
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
                  {isDistracted ? '😴' : '👀'}
                </Text>
                <Text style={styles.sessionLabel}>Attention</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── CAMERA MONITOR (NEW TODAY) ── */}
        <CameraMonitor
          driveModeActive={driveModeActive}
          isDistracted={isDistracted}
          distractionReason={distractionReason}
          distractionCount={distractionCount}
          showWarning={showWarning}
          dismissWarning={dismissWarning}
          attentionData={attentionData}
          analyzeFrame={analyzeFrame}
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
                <Text style={styles.sessionHistoryScore}>+{session.score} pts</Text>
              </View>
            ))}
          </View>
        )}

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
  badge: { backgroundColor: '#ff6b6b', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 },
  badgeText: { fontSize: 12, color: '#ffffff', fontWeight: '600' },
  warningBanner: { backgroundColor: '#2d1f0a', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#ffa657' },
  warningText: { fontSize: 12, color: '#ffa657', textAlign: 'center' },
  sessionCard: { backgroundColor: '#0d2b1e', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#00ff87' },
  sessionTitle: { fontSize: 12, color: '#00ff87', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '600', marginBottom: 14 },
  sessionRow: { flexDirection: 'row', alignItems: 'center' },
  sessionStat: { flex: 1, alignItems: 'center' },
  sessionValue: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', fontVariant: ['tabular-nums'] },
  sessionLabel: { fontSize: 11, color: '#8892b0', marginTop: 4 },
  sessionDivider: { width: 1, height: 40, backgroundColor: '#21262d' },
  card: { backgroundColor: '#161b22', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#21262d' },
  cardTitle: { fontSize: 12, color: '#8892b0', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14, fontWeight: '600' },
  sessionHistoryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#21262d' },
  sessionHistoryIcon: { fontSize: 18, marginRight: 10 },
  sessionHistoryTime: { flex: 1, fontSize: 13, color: '#8892b0' },
  sessionHistoryDuration: { fontSize: 13, color: '#c9d1d9', marginRight: 12 },
  sessionHistoryScore: { fontSize: 13, color: '#00ff87', fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: 14, color: '#c9d1d9', fontWeight: '600' },
});