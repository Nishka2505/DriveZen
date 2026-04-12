import { Accelerometer, Gyroscope } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SensorCard from '../../frontend/components/SensorCard';
import SpeedCard from '../../frontend/components/SpeedCard';
import useLocation from '../../frontend/hooks/useLocation';

// index.tsx — Day 4: GPS Speed Tracking
//
// New today:
// - useLocation hook gives us live GPS speed
// - SpeedCard shows speed with color coding
// - Auto Drive Mode suggestion when speed > 15 km/h
// - Alert popup asks user to enable Drive Mode

export default function HomeScreen() {
  const [driveModeActive, setDriveModeActive] = useState(false);
  const [sensorsEnabled, setSensorsEnabled] = useState(true);
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
  const accelSubscription = useRef(null);
  const gyroSubscription = useRef(null);

  // ── GPS HOOK ──────────────────────────────────────────
  // useLocation() runs our GPS logic and returns live data
  // Every time speed changes, this component re-renders with new value
  const {
    speed,
    permissionStatus,
    isTracking,
    error: locationError,
  } = useLocation();

  // ── AUTO DRIVE MODE SUGGESTION ────────────────────────
  // Watch the speed — if it crosses 15 km/h and Drive Mode is OFF,
  // show an alert asking the user to turn it on
  // useRef tracks if we already showed the alert (avoid spamming)
  const alertShown = useRef(false);

  useEffect(() => {
    if (speed >= 15 && !driveModeActive && !alertShown.current) {
      alertShown.current = true;

      // Alert.alert shows a native popup dialog on the phone
      Alert.alert(
        '🚗 Driving Detected',
        `Your speed is ${speed.toFixed(1)} km/h.\nActivate Drive Mode for safety?`,
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => {
              // Reset after 30 seconds so it can ask again
              setTimeout(() => { alertShown.current = false; }, 30000);
            },
          },
          {
            text: 'Activate',
            onPress: () => {
              setDriveModeActive(true);
              alertShown.current = false;
            },
          },
        ]
      );
    }

    // If speed drops below 5 km/h reset the alert flag
    if (speed < 5) {
      alertShown.current = false;
    }
  }, [speed, driveModeActive]);

  // ── SENSORS ───────────────────────────────────────────
  const startSensors = () => {
    Accelerometer.setUpdateInterval(200);
    Gyroscope.setUpdateInterval(200);
    accelSubscription.current = Accelerometer.addListener(setAccelData);
    gyroSubscription.current = Gyroscope.addListener(setGyroData);
  };

  const stopSensors = () => {
    accelSubscription.current?.remove();
    gyroSubscription.current?.remove();
    accelSubscription.current = null;
    gyroSubscription.current = null;
  };

  useEffect(() => {
    if (sensorsEnabled) startSensors();
    return () => stopSensors();
  }, []);

  const handleSensorToggle = (value) => {
    setSensorsEnabled(value);
    if (value) {
      startSensors();
    } else {
      stopSensors();
      setAccelData({ x: 0, y: 0, z: 0 });
      setGyroData({ x: 0, y: 0, z: 0 });
    }
  };

  const totalMotion = Math.abs(accelData.x) + Math.abs(accelData.y) + Math.abs(accelData.z);
  const isMoving = totalMotion > 1.5;

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

        {/* ── DRIVE MODE BUTTON ── */}
        <TouchableOpacity
          style={[
            styles.driveButton,
            driveModeActive ? styles.driveButtonActive : styles.driveButtonInactive,
          ]}
          onPress={() => setDriveModeActive(prev => !prev)}
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

        {/* ── GPS SPEED CARD ── */}
        {/* This is new today — shows real live speed! */}
        <SpeedCard
          speed={speed}
          isTracking={isTracking}
          permissionStatus={permissionStatus}
        />

        {/* ── MOTION STATUS ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Motion Status</Text>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusDot,
              isMoving ? styles.dotActive : styles.dotInactive
            ]} />
            <Text style={[
              styles.statusText,
              isMoving ? styles.statusTextActive : styles.statusTextInactive
            ]}>
              {isMoving ? 'MOVEMENT DETECTED' : 'STATIONARY'}
            </Text>
          </View>
          <Text style={styles.cardHint}>
            Motion: {totalMotion.toFixed(2)} · Speed: {speed.toFixed(1)} km/h
            {'\n'}ML classification starts Day 6
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
          <Text style={styles.cardHint}>
            {sensorsEnabled ? 'Move your phone to see values change' : 'Sensors paused'}
          </Text>
        </View>

        {/* ── ACCELEROMETER ── */}
        <SensorCard
          title="Accelerometer"
          icon="📱"
          data={accelData}
          color="#58a6ff"
        />

        {/* ── GYROSCOPE ── */}
        <SensorCard
          title="Gyroscope"
          icon="🔄"
          data={gyroData}
          color="#bc8cff"
        />

        {/* ── DATA SUMMARY ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Data Being Collected</Text>
          <Text style={styles.cardHint}>
            This is the full dataset we'll send to the ML model on Day 7
          </Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>
              {JSON.stringify({
                speed_kmh: speed.toFixed(2),
                accel_x: accelData.x.toFixed(4),
                accel_y: accelData.y.toFixed(4),
                accel_z: accelData.z.toFixed(4),
                gyro_x: gyroData.x.toFixed(4),
                gyro_y: gyroData.y.toFixed(4),
                gyro_z: gyroData.z.toFixed(4),
              }, null, 2)}
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1117' },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { paddingTop: 20, paddingBottom: 24, alignItems: 'center' },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  appTagline: { fontSize: 13, color: '#8892b0', letterSpacing: 2 },
  driveButton: {
    borderRadius: 20, paddingVertical: 28,
    alignItems: 'center', marginBottom: 20, borderWidth: 2,
  },
  driveButtonActive: { backgroundColor: '#0d2b1e', borderColor: '#00ff87' },
  driveButtonInactive: { backgroundColor: '#161b22', borderColor: '#30363d' },
  driveButtonIcon: { fontSize: 44, marginBottom: 10 },
  driveButtonText: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  driveButtonSub: { fontSize: 13, color: '#8892b0' },
  card: {
    backgroundColor: '#161b22', borderRadius: 16,
    padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#21262d',
  },
  cardTitle: {
    fontSize: 12, color: '#8892b0', textTransform: 'uppercase',
    letterSpacing: 1.5, marginBottom: 14, fontWeight: '600',
  },
  cardHint: { fontSize: 12, color: '#484f58', marginTop: 8, lineHeight: 18 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  dotActive: { backgroundColor: '#00ff87' },
  dotInactive: { backgroundColor: '#484f58' },
  statusText: { fontSize: 18, fontWeight: 'bold' },
  statusTextActive: { color: '#00ff87' },
  statusTextInactive: { color: '#484f58' },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  toggleLabel: { fontSize: 14, color: '#c9d1d9', fontWeight: '600' },
  codeBox: {
    backgroundColor: '#0d1117', borderRadius: 8, padding: 12,
    marginTop: 10, borderWidth: 1, borderColor: '#21262d',
  },
  codeText: {
    fontSize: 11, color: '#00ff87',
    fontFamily: 'monospace', lineHeight: 18,
  },
});