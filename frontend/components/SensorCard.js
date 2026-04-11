import { StyleSheet, Text, View } from 'react-native';

// SensorCard.js — A reusable component that displays
// sensor readings (x, y, z values) in a clean card.
//
// We use this for both accelerometer AND gyroscope
// because they have the same structure — just different data.
//
// Props this component accepts:
//   title  — the card heading e.g. "Accelerometer"
//   icon   — emoji icon e.g. "📱"
//   data   — object with x, y, z numbers
//   color  — the color for the value text

export default function SensorCard({ title, icon, data, color }) {

  // Round to 3 decimal places so it doesn't show too many digits
  const fmt = (val) => val.toFixed(3);

  // Determine movement intensity from the combined sensor values
  // We use Math.abs to make negatives positive first
  const intensity = Math.abs(data.x) + Math.abs(data.y) + Math.abs(data.z);

  // Label the intensity level
  const getIntensityLabel = () => {
    if (intensity < 0.5) return { label: 'STILL', color: '#484f58' };
    if (intensity < 2.0) return { label: 'LOW', color: '#58a6ff' };
    if (intensity < 5.0) return { label: 'MEDIUM', color: '#ffa657' };
    return { label: 'HIGH', color: '#ff6b6b' };
  };

  const intensityInfo = getIntensityLabel();

  return (
    <View style={styles.card}>

      {/* Card header */}
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        {/* Intensity badge in top right */}
        <View style={[styles.badge, { borderColor: intensityInfo.color }]}>
          <Text style={[styles.badgeText, { color: intensityInfo.color }]}>
            {intensityInfo.label}
          </Text>
        </View>
      </View>

      {/* X, Y, Z values displayed in a row */}
      <View style={styles.valuesRow}>

        <View style={styles.valueBox}>
          <Text style={styles.axisLabel}>X</Text>
          <Text style={[styles.value, { color }]}>{fmt(data.x)}</Text>
          <Text style={styles.axisHint}>left/right</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.valueBox}>
          <Text style={styles.axisLabel}>Y</Text>
          <Text style={[styles.value, { color }]}>{fmt(data.y)}</Text>
          <Text style={styles.axisHint}>up/down</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.valueBox}>
          <Text style={styles.axisLabel}>Z</Text>
          <Text style={[styles.value, { color }]}>{fmt(data.z)}</Text>
          <Text style={styles.axisHint}>forward/back</Text>
        </View>

      </View>

      {/* Visual intensity bar at the bottom of the card */}
      <View style={styles.barBg}>
        <View style={[
          styles.barFill,
          {
            // Cap at 100% width — intensity goes from 0 to 10
            width: `${Math.min(intensity / 10 * 100, 100)}%`,
            backgroundColor: intensityInfo.color,
          }
        ]} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#21262d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 13,
    color: '#8892b0',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  valuesRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  valueBox: {
    flex: 1,
    alignItems: 'center',
  },
  axisLabel: {
    fontSize: 11,
    color: '#484f58',
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 1,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  axisHint: {
    fontSize: 9,
    color: '#484f58',
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#21262d',
    marginHorizontal: 8,
  },
  barBg: {
    height: 4,
    backgroundColor: '#21262d',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
});