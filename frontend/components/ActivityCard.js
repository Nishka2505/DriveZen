import { StyleSheet, Text, View } from 'react-native';

// ActivityCard.js — Shows the ML model's activity prediction
// with confidence bars for all 3 classes.
//
// Props:
//   activity    — 'sitting', 'walking', 'driving', or 'UNKNOWN'
//   confidence  — 0.0 to 1.0
//   allProbs    — { sitting: 0.03, walking: 0.05, driving: 0.92 }
//   isConnected — whether API is reachable
//   isLoading   — whether a request is in progress
//   error       — error message or null

export default function ActivityCard({
  activity,
  confidence,
  allProbs,
  isConnected,
  isLoading,
  error,
  predictionCount,
}) {

  // Config for each activity type
  const activityConfig = {
    sitting: { emoji: '🪑', color: '#58a6ff', label: 'SITTING' },
    walking: { emoji: '🚶', color: '#ffa657', label: 'WALKING' },
    driving: { emoji: '🚗', color: '#00ff87', label: 'DRIVING' },
    UNKNOWN: { emoji: '❓', color: '#484f58', label: 'UNKNOWN' },
  };

  const config = activityConfig[activity] || activityConfig['UNKNOWN'];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>AI Activity Detection</Text>
        {/* Connection status dot */}
        <View style={styles.statusRow}>
          <View style={[
            styles.dot,
            isConnected ? styles.dotGreen : styles.dotRed
          ]} />
          <Text style={styles.statusText}>
            {isConnected ? 'API Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️  {error}</Text>
        </View>
      )}

      {/* Main activity display */}
      <View style={styles.activityRow}>
        <Text style={styles.activityEmoji}>{config.emoji}</Text>
        <View style={styles.activityInfo}>
          <Text style={[styles.activityLabel, { color: config.color }]}>
            {config.label}
          </Text>
          <Text style={styles.confidenceText}>
            {(confidence * 100).toFixed(1)}% confident
          </Text>
        </View>
        {/* Loading spinner text */}
        {isLoading && (
          <Text style={styles.loadingText}>⟳</Text>
        )}
      </View>

      {/* Confidence bars for all 3 activities */}
      {allProbs && (
        <View style={styles.barsContainer}>
          {Object.entries(allProbs).map(([act, prob]) => {
            const cfg = activityConfig[act] || activityConfig['UNKNOWN'];
            const isActive = act === activity;
            return (
              <View key={act} style={styles.barRow}>
                <Text style={styles.barLabel}>{cfg.emoji} {act}</Text>
                <View style={styles.barBg}>
                  <View style={[
                    styles.barFill,
                    {
                      width: `${prob * 100}%`,
                      backgroundColor: isActive ? cfg.color : '#30363d',
                    }
                  ]} />
                </View>
                <Text style={[
                  styles.barPercent,
                  isActive ? { color: cfg.color } : {}
                ]}>
                  {(prob * 100).toFixed(0)}%
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <Text style={styles.cardHint}>
        {isConnected
          ? `📡 Sending sensor data every 2s · ${predictionCount} predictions made`
          : `📡 Make sure Flask is running: python app.py`}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 12,
    color: '#8892b0',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotGreen: { backgroundColor: '#00ff87' },
  dotRed: { backgroundColor: '#ff6b6b' },
  statusText: {
    fontSize: 11,
    color: '#8892b0',
  },
  errorBox: {
    backgroundColor: '#2d1515',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  errorText: {
    fontSize: 12,
    color: '#ff6b6b',
    lineHeight: 18,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityEmoji: {
    fontSize: 40,
    marginRight: 14,
  },
  activityInfo: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 13,
    color: '#8892b0',
  },
  loadingText: {
    fontSize: 24,
    color: '#8892b0',
  },
  barsContainer: {
    marginBottom: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barLabel: {
    width: 80,
    fontSize: 12,
    color: '#8892b0',
  },
  barBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#21262d',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  barPercent: {
    width: 36,
    fontSize: 11,
    color: '#8892b0',
    textAlign: 'right',
  },
  cardHint: {
    fontSize: 11,
    color: '#484f58',
    lineHeight: 17,
  },
});