import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>🚗 SafeDrive</Text>
        <Text style={styles.subtitle}>AI-Powered Driving Safety</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Status</Text>
          <Text style={styles.statusText}>Setting up...</Text>
          <Text style={styles.cardHint}>
            Day 1 — Project initialized successfully ✅
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#8892b0', marginBottom: 40 },
  card: { backgroundColor: '#16213e', borderRadius: 16, padding: 28, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#0f3460' },
  cardLabel: { fontSize: 12, color: '#8892b0', marginBottom: 12 },
  statusText: { fontSize: 28, fontWeight: 'bold', color: '#64ffda', marginBottom: 16 },
  cardHint: { fontSize: 13, color: '#8892b0', textAlign: 'center' },
});