import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// CameraMonitor.js — Front camera attention monitoring UI
//
// This component:
// 1. Requests camera permission
// 2. Shows a small camera preview (front camera)
// 3. Captures a frame every 1.5 seconds
// 4. Passes frame to useAttention hook for analysis
// 5. Shows distraction alert overlay
// 6. Shows full-screen warning if distracted repeatedly
//
// The camera only activates when Drive Mode is ON
// to save battery and privacy

export default function CameraMonitor({
  driveModeActive,
  isDistracted,
  distractionReason,
  distractionCount,
  showWarning,
  dismissWarning,
  attentionData,
  analyzeFrame,
}) {

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(false);
  const cameraRef = useRef(null);
  const intervalRef = useRef(null);

  // ── ACTIVATE CAMERA WHEN DRIVE MODE ON ────────────────
  useEffect(() => {
    if (driveModeActive && permission?.granted) {
      setCameraActive(true);
      startCapturing();
    } else {
      setCameraActive(false);
      stopCapturing();
    }

    return () => stopCapturing();
  }, [driveModeActive, permission]);

  // ── CAPTURE FRAMES ────────────────────────────────────
  const startCapturing = () => {
    // Capture and analyze every 1500ms
    intervalRef.current = setInterval(() => {
      captureFrame();
    }, 1500);
  };

  const stopCapturing = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const captureFrame = async () => {
    if (!cameraRef.current) return;

    try {
      // takePictureAsync captures the current camera frame
      // base64: true → converts image to base64 string
      // quality: 0.3 → low quality = smaller file = faster to send
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.3,
        skipProcessing: true,
      });

      if (photo?.base64) {
        // Send to API for analysis
        await analyzeFrame(photo.base64);
      }
    } catch (error) {
      // Camera might not be ready yet — silently ignore
    }
  };

  // ── PERMISSION NOT GRANTED ─────────────────────────────
  if (!permission) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👁️ Attention Monitor</Text>
        <Text style={styles.hint}>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👁️ Attention Monitor</Text>
        <Text style={styles.permText}>
          Camera permission needed for attention monitoring
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      {/* ── FULL SCREEN WARNING MODAL ── */}
      <Modal
        visible={showWarning}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.warningOverlay}>
          <View style={styles.warningBox}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningTitle}>EYES ON THE ROAD!</Text>
            <Text style={styles.warningSubtitle}>
              Distraction detected multiple times
            </Text>
            <Text style={styles.warningReason}>{distractionReason}</Text>
            <TouchableOpacity
              style={styles.warningBtn}
              onPress={dismissWarning}
            >
              <Text style={styles.warningBtnText}>I'm Focused Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── CAMERA CARD ── */}
      <View style={[
        styles.card,
        isDistracted && driveModeActive ? styles.cardDistracted : {}
      ]}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>👁️ Attention Monitor</Text>
          <View style={[
            styles.statusBadge,
            driveModeActive
              ? (isDistracted ? styles.badgeRed : styles.badgeGreen)
              : styles.badgeOff
          ]}>
            <Text style={styles.statusText}>
              {!driveModeActive ? 'OFF' : isDistracted ? 'DISTRACTED' : 'FOCUSED'}
            </Text>
          </View>
        </View>

        {/* Camera preview — only shows when Drive Mode is ON */}
        {driveModeActive && cameraActive ? (
          <View style={styles.cameraContainer}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
            />
            {/* Distraction overlay on camera */}
            {isDistracted && (
              <View style={styles.distractionOverlay}>
                <Text style={styles.distractionIcon}>⚠️</Text>
                <Text style={styles.distractionText}>DISTRACTED</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.cameraOff}>
            <Text style={styles.cameraOffIcon}>📷</Text>
            <Text style={styles.cameraOffText}>
              {driveModeActive
                ? 'Starting camera...'
                : 'Camera activates when Drive Mode is ON'}
            </Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{distractionCount}</Text>
            <Text style={styles.statLabel}>Distractions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[
              styles.statValue,
              { color: isDistracted ? '#ff6b6b' : '#00ff87' }
            ]}>
              {isDistracted ? '😴' : '👀'}
            </Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {attentionData?.avg_ear
                ? attentionData.avg_ear.toFixed(2)
                : '--'}
            </Text>
            <Text style={styles.statLabel}>Eye Rate</Text>
          </View>
        </View>

        {/* Current reason */}
        {isDistracted && (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonText}>⚠️ {distractionReason}</Text>
          </View>
        )}

        <Text style={styles.hint}>
          {driveModeActive
            ? '📸 Analyzing frame every 1.5s · Alert after 3 distractions'
            : 'Monitoring starts when Drive Mode activates'}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161b22', borderRadius: 16,
    padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#21262d',
  },
  cardDistracted: { borderColor: '#ff6b6b' },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  cardTitle: {
    fontSize: 12, color: '#8892b0',
    textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1,
  },
  badgeGreen: { backgroundColor: '#0d2b1e', borderColor: '#00ff87' },
  badgeRed: { backgroundColor: '#2d0d0d', borderColor: '#ff6b6b' },
  badgeOff: { backgroundColor: '#161b22', borderColor: '#30363d' },
  statusText: { fontSize: 10, fontWeight: '700', color: '#ffffff' },
  cameraContainer: {
    height: 160, borderRadius: 12,
    overflow: 'hidden', marginBottom: 14, position: 'relative',
  },
  camera: { flex: 1 },
  distractionOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 107, 107, 0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  distractionIcon: { fontSize: 32, marginBottom: 8 },
  distractionText: {
    color: '#ffffff', fontSize: 18, fontWeight: 'bold', letterSpacing: 2,
  },
  cameraOff: {
    height: 120, backgroundColor: '#0d1117', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, borderWidth: 1, borderColor: '#21262d',
  },
  cameraOffIcon: { fontSize: 32, marginBottom: 8 },
  cameraOffText: { fontSize: 13, color: '#484f58', textAlign: 'center' },
  statsRow: { flexDirection: 'row', marginBottom: 12 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#8892b0' },
  statDivider: { width: 1, backgroundColor: '#21262d', marginHorizontal: 8 },
  reasonBox: {
    backgroundColor: '#2d0d0d', borderRadius: 8,
    padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#ff6b6b',
  },
  reasonText: { fontSize: 12, color: '#ff6b6b', textAlign: 'center' },
  hint: { fontSize: 12, color: '#484f58', lineHeight: 18 },
  permText: { fontSize: 14, color: '#8892b0', marginBottom: 16, lineHeight: 20 },
  permBtn: {
    backgroundColor: '#0d2b1e', borderRadius: 10,
    padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#00ff87',
  },
  permBtnText: { fontSize: 14, color: '#00ff87', fontWeight: '600' },
  // Full screen warning modal
  warningOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  warningBox: {
    backgroundColor: '#1a0505', borderRadius: 20,
    padding: 32, alignItems: 'center', width: '100%',
    borderWidth: 2, borderColor: '#ff6b6b',
  },
  warningIcon: { fontSize: 64, marginBottom: 16 },
  warningTitle: {
    fontSize: 28, fontWeight: 'bold', color: '#ff6b6b',
    letterSpacing: 2, marginBottom: 8,
  },
  warningSubtitle: { fontSize: 16, color: '#8892b0', marginBottom: 8 },
  warningReason: {
    fontSize: 14, color: '#484f58', textAlign: 'center',
    marginBottom: 24, lineHeight: 20,
  },
  warningBtn: {
    backgroundColor: '#ff6b6b', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 32,
  },
  warningBtnText: { fontSize: 16, color: '#ffffff', fontWeight: 'bold' },
});