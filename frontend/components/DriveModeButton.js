import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// DriveModeButton.js — The main Drive Mode button
// Now shows detection state and session timer.
//
// States:
//   MONITORING  — watching, not driving
//   CONFIRMING  — looks like driving, counting down
//   DRIVING     — confirmed driving, showing timer
//   STOPPING    — was driving, checking if stopped

export default function DriveModeButton({
  driveModeActive,
  onPress,
  detectionState,
  sessionTime,
  speed,
  activity,
}) {

  // Config for each detection state
  const stateConfig = {
    MONITORING: {
      borderColor: '#30363d',
      backgroundColor: '#161b22',
      icon: '🚗',
      title: 'DRIVE MODE OFF',
      subtitle: 'Auto-detection active',
    },
    CONFIRMING: {
      borderColor: '#ffa657',
      backgroundColor: '#1c1a0e',
      icon: '⏳',
      title: 'DETECTING...',
      subtitle: 'Confirming driving activity',
    },
    DRIVING: {
      borderColor: '#00ff87',
      backgroundColor: '#0d2b1e',
      icon: '🛡️',
      title: 'DRIVE MODE ON',
      subtitle: sessionTime,
    },
    STOPPING: {
      borderColor: '#58a6ff',
      backgroundColor: '#0d1f2d',
      icon: '🔍',
      title: 'CHECKING...',
      subtitle: 'Confirming trip ended',
    },
  };

  const config = stateConfig[detectionState] || stateConfig['MONITORING'];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          borderColor: config.borderColor,
          backgroundColor: config.backgroundColor,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Detection state indicator dots */}
      <View style={styles.dotsRow}>
        <DetectionDot
          active={detectionState !== 'MONITORING'}
          color="#ffa657"
        />
        <DetectionDot
          active={detectionState === 'DRIVING' || detectionState === 'STOPPING'}
          color="#ffa657"
        />
        <DetectionDot
          active={detectionState === 'DRIVING'}
          color="#00ff87"
        />
      </View>

      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={[styles.title, { color: config.borderColor }]}>
        {config.title}
      </Text>
      <Text style={styles.subtitle}>{config.subtitle}</Text>

      {/* Show current speed and AI reading */}
      <View style={styles.infoRow}>
        <View style={styles.infoPill}>
          <Text style={styles.infoPillText}>
            📍 {speed.toFixed(1)} km/h
          </Text>
        </View>
        <View style={styles.infoPill}>
          <Text style={styles.infoPillText}>
            🤖 {activity.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.tapHint}>Tap to manually toggle</Text>
    </TouchableOpacity>
  );
}

// Small dot indicator
function DetectionDot({ active, color }) {
  return (
    <View style={[
      styles.dot,
      { backgroundColor: active ? color : '#21262d' }
    ]} />
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  icon: {
    fontSize: 44,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#8892b0',
    marginBottom: 14,
    fontVariant: ['tabular-nums'],
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  infoPill: {
    backgroundColor: '#21262d',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  infoPillText: {
    fontSize: 12,
    color: '#8892b0',
  },
  tapHint: {
    fontSize: 11,
    color: '#484f58',
  },
});