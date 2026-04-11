import { Accelerometer, Gyroscope } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SensorCard from '../../frontend/components/SensorCard';

// index.tsx — Day 3: Live Sensor Data
//
// New concepts today:
//
// useEffect — runs code AFTER the component appears on screen.
//   We use it to start the sensor subscriptions when the screen loads
//   and stop them when the screen unloads (cleanup).
//
// useRef — stores a value that doesn't cause re-renders when it changes.
//   We use it to hold the sensor subscription objects so we can
//   stop them later without triggering unnecessary renders.
//
// Accelerometer.addListener — tells the phone:
//   "every X milliseconds, give me the current x/y/z acceleration values"
//
// subscription.remove() — tells the phone:
//   "stop sending me sensor data" (saves battery)

export default function HomeScreen() {
  const [driveModeActive, setDriveModeActive] = useState(false);
  const [sensorsEnabled, setSensorsEnabled] = useState(true);

  // Live sensor data stored in state
  // When these change, React automatically updates the display
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });

  // useRef stores the subscriptions so we can cancel them later
  // We use ref (not state) because changing it doesn't need a re-render
  const accelSubscription = useRef(null);
  const gyroSubscription = useRef(null);

  // ── START SENSORS ──────────────────────────────────────
  const startSensors = () => {
    // How often to read sensors — 200ms = 5 times per second
    // Lower = faster but uses more battery
    Accelerometer.setUpdateInterval(200);
    Gyroscope.setUpdateInterval(200);

    // addListener gives us new data every 200ms
    // The { x, y, z } object arrives automatically
    accelSubscription.current = Accelerometer.addListener((data) => {
      setAccelData(data); // update state → triggers re-render → UI updates
    });

    gyroSubscription.current = Gyroscope.addListener((data) => {
      setGyroData(data);
    });
  };

  // ── STOP SENSORS ───────────────────────────────────────
  const stopSensors = () => {
    // .remove() stops the sensor from sending data
    // Important: always stop sensors when not needed to save battery
    if (accelSubscription.current) {
      accelSubscription.current.remove();
      accelSubscription.current = null;
    }
    if (gyroSubscription.current) {
      gyroSubscription.current.remove();
      gyroSubscription.current = null;
    }
  };

  // ── useEffect: START SENSORS WHEN SCREEN LOADS ─────────
  // The [] at the end means "run this only once when component mounts"
  // The return function is the "cleanup" — runs when screen unmounts
  useEffect(() => {
    if (sensorsEnabled) {
      startSensors();
    }
    // Cleanup: stop sensors when user navigates away from this screen
    return () => stopSensors();
  }, []); // eslint-disable-line

  // ── TOGGLE SENSORS ON/OFF ──────────────────────────────
  const handleSensorToggle = (value) => {
    setSensorsEnabled(value);
    if (value) {
      startSensors();
    } else {
      stopSensors();
      // Reset to zero when stopped
      setAccelData({ x: 0, y: 0, z: 0 });
      setGyroData({ x: 0, y: 0, z: 0 });
    }
  };

  // ── DRIVE MODE TOGGLE ──────────────────────────────────
  const toggleDriveMode = () => {
    setDriveModeActive((prev) => !prev);
  };

  // ── MOVEMENT DETECTION ─────────────────────────────────
  // Simple rule: if total acceleration > 1.2, the phone is moving
  // We subtract gravity (≈1.0 on z-axis when phone is flat)
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
            Total motion intensity: {totalMotion.toFixed(2)}
            {'\n'}ML classification starts Day 6
          </Text>
        </View>

        {/* ── SENSOR TOGGLE ── */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>📡  Live Sensor Reading</Text>
            {/* Switch is a toggle/switch UI element built into React Native */}
            <Switch
              value={sensorsEnabled}
              onValueChange={handleSensorToggle}
              trackColor={{ false: '#21262d', true: '#0d2b1e' }}
              thumbColor={sensorsEnabled ? '#00ff87' : '#484f58'}
            />
          </View>
          <Text style={styles.cardHint}>
            {sensorsEnabled
              ? 'Sensors active — move your phone to see values change'
              : 'Sensors paused — toggle to resume'}
          </Text>
        </View>

        {/* ── ACCELEROMETER CARD ── */}
        {/* This shows live x/y/z acceleration values */}
        {/* Move your phone around and watch them change! */}
        <SensorCard
          title="Accelerometer"
          icon="📱"
          data={accelData}
          color="#58a6ff"
        />

        {/* ── GYROSCOPE CARD ── */}
        {/* This shows live rotation values */}
        {/* Rotate/tilt your phone and watch them change! */}
        <SensorCard
          title="Gyroscope"
          icon="🔄"
          data={gyroData}
          color="#bc8cff"
        />

        {/* ── RAW DATA LOG ── */}
        {/* Shows the raw numbers like a terminal/console */}
        {/* This is how the data will be sent to the ML model on Day 7 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Raw Data Log</Text>
          <Text style={styles.cardHint}>
            This is the data format we'll send to the ML model on Day 7
          </Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>
              {JSON.stringify({
                accel_x: accelData.x.toFixed(4),
                accel_y: accelData.y.toFixed(4),
                accel_z: accelData.z.toFixed(4),
                gyro_x: gyroData.x.toFixed(4),
                gyro_y: gyroData.y.toFixed(4),
                gyro_z: gyroData.z.toFixed(4),
                timestamp: new Date().toISOString(),
              }, null, 2)}
            </Text>
          </View>
        </View>

        {/* ── SPEED CARD ── */}
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
  speedRow: { flexDirection: 'row', alignItems: 'flex-end' },
  speedNumber: { fontSize: 52, fontWeight: 'bold', color: '#58a6ff', lineHeight: 56 },
  speedUnit: { fontSize: 18, color: '#8892b0', marginBottom: 8, marginLeft: 8 },
  codeBox: {
    backgroundColor: '#0d1117', borderRadius: 8, padding: 12,
    marginTop: 10, borderWidth: 1, borderColor: '#21262d',
  },
  codeText: {
    fontSize: 11, color: '#00ff87',
    fontFamily: 'monospace', lineHeight: 18,
  },
});