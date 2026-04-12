import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// SpeedCard.js — Displays the current GPS speed
// with a color-coded speedometer feel.
//
// Props:
//   speed         — current speed in km/h (number)
//   isTracking    — whether GPS is active (boolean)
//   permissionStatus — 'pending', 'granted', 'denied'

export default function SpeedCard({ speed, isTracking, permissionStatus }) {

  // Color changes based on speed zone
  // Green = safe, Yellow = caution, Red = dangerous
  const getSpeedColor = () => {
    if (speed < 15) return '#00ff87';   // green — not driving
    if (speed < 60) return '#ffa657';   // orange — moderate speed
    if (speed < 100) return '#ff6b6b';  // red — high speed
    return '#ff0000';                    // bright red — very high speed
  };

  // Speed zone label
  const getSpeedZone = () => {
    if (!isTracking) return { label: 'GPS OFF', color: '#484f58' };
    if (speed < 5)  return { label: 'STATIONARY', color: '#484f58' };
    if (speed < 15) return { label: 'WALKING/SLOW', color: '#00ff87' };
    if (speed < 60) return { label: 'DRIVING', color: '#ffa657' };
    if (speed < 100) return { label: 'FAST', color: '#ff6b6b' };
    return { label: 'VERY FAST', color: '#ff0000' };
  };

  const zone = getSpeedZone();
  const speedColor = getSpeedColor();

  // Permission denied message
  if (permissionStatus === 'denied') {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Speed</Text>
        <Text style={styles.errorText}>📍 Location permission denied</Text>
        <Text style={styles.cardHint}>
          Go to phone Settings → DriveZen → Location → Allow
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Current Speed</Text>

      {/* Main speed display */}
      <View style={styles.speedRow}>
        <Text style={[styles.speedNumber, { color: speedColor }]}>
          {speed.toFixed(1)}
        </Text>
        <View style={styles.speedRight}>
          <Text style={styles.speedUnit}>km/h</Text>
          {/* Speed zone badge */}
          <View style={[styles.zoneBadge, { borderColor: zone.color }]}>
            <Text style={[styles.zoneText, { color: zone.color }]}>
              {zone.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Speed bar — visual indicator */}
      {/* Bar fills up as speed increases, maxes out at 120 km/h */}
      <View style={styles.barBg}>
        <View style={[
          styles.barFill,
          {
            width: `${Math.min((speed / 120) * 100, 100)}%`,
            backgroundColor: speedColor,
          }
        ]} />
      </View>

      {/* Speed zone markers below the bar */}
      <View style={styles.markers}>
        <Text style={styles.marker}>0</Text>
        <Text style={styles.marker}>30</Text>
        <Text style={styles.marker}>60</Text>
        <Text style={styles.marker}>90</Text>
        <Text style={styles.marker}>120</Text>
      </View>

      {/* Drive Mode suggestion */}
      {speed >= 15 && (
        <View style={styles.suggestionBox}>
          <Text style={styles.suggestionText}>
            🚗 Speed over 15 km/h — Drive Mode recommended!
          </Text>
        </View>
      )}

      <Text style={styles.cardHint}>
        {isTracking
          ? '📡 GPS active — speed updates every second'
          : '⏳ Connecting to GPS...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#21262d',
  },
  cardTitle: {
    fontSize: 12,
    color: '#8892b0',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 14,
    fontWeight: '600',
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  speedNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    lineHeight: 68,
    fontVariant: ['tabular-nums'],
  },
  speedRight: {
    marginLeft: 10,
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  speedUnit: {
    fontSize: 18,
    color: '#8892b0',
    marginBottom: 6,
  },
  zoneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  zoneText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  barBg: {
    height: 6,
    backgroundColor: '#21262d',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  markers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  marker: {
    fontSize: 10,
    color: '#484f58',
  },
  suggestionBox: {
    backgroundColor: '#1c2a1c',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#00ff87',
  },
  suggestionText: {
    fontSize: 12,
    color: '#00ff87',
    textAlign: 'center',
  },
  cardHint: {
    fontSize: 12,
    color: '#484f58',
    marginTop: 4,
    lineHeight: 18,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    marginBottom: 8,
  },
});