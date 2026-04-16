import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated, Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// CameraMonitor.js — Day 12: Full attention monitoring UI
//
// New today:
// - Animated warning screen (pulsing red border)
// - Warning level display (CAUTION/WARNING/CRITICAL)
// - Distraction history list
// - Distraction rate display
// - Better camera preview with face detection overlay

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CameraMonitor({
  driveModeActive,
  isDistracted,
  distractionReason = '',
  distractionCount = 0,
  warningLevel = 'CAUTION',
  showWarning = false,
  dismissWarning = () => {},
  attentionData = null,
  analyzeFrame = () => {},
  distractionHistory = [],
  distractionRate = 0,
  clearHistory = () => {},
}) {

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const intervalRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showHistory, setShowHistory] = useState(false);

  // ── PULSING ANIMATION FOR WARNING ─────────────────────
  useEffect(() => {
    if (isDistracted && driveModeActive) {
      // Start pulsing red border animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isDistracted, driveModeActive]);

  // ── CAMERA CAPTURE LOOP ────────────────────────────────
  useEffect(() => {
    if (driveModeActive && permission?.granted) {
      startCapturing();
    } else {
      stopCapturing();
    }
    return () => stopCapturing();
  }, [driveModeActive, permission]);

  const startCapturing = () => {
    intervalRef.current = setInterval(captureFrame, 1500);
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
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.3,
        skipProcessing: true,
      });
      if (photo?.base64) {
        await analyzeFrame(photo.base64);
      }
    } catch (error) {
      // Camera not ready yet
    }
  };

  // ── WARNING LEVEL CONFIG ───────────────────────────────
  const warningConfig = {
    CAUTION: {
      color: '#ffa657',
      bg: '#2d1f0a',
      icon: '⚠️',
      message: 'Stay focused on the road',
    },
    WARNING: {
      color: '#ff6b6b',
      bg: '#2d0d0d',
      icon: '🚨',
      message: 'Multiple distractions detected!',
    },
    CRITICAL: {
      color: '#ff0000',
      bg: '#1a0000',
      icon: '🛑',
      message: 'CRITICAL — Pull over safely!',
    },
  };

  const warnConfig = warningConfig[warningLevel] || warningConfig.CAUTION;

  // ── NO PERMISSION ──────────────────────────────────────
  if (!permission?.granted) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👁️ Attention Monitor</Text>
        <Text style={styles.permText}>
          Camera access needed for distraction detection
        </Text>
        <TouchableOpacity
          style={styles.permBtn}
          onPress={requestPermission}
        >
          <Text style={styles.permBtnText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      {/* ── FULL SCREEN WARNING MODAL ── */}
      <Modal visible={showWarning} transparent animationType="fade">
        <Animated.View style={[styles.warningOverlay, { opacity: pulseAnim }]}>
          <View style={[styles.warningBox, { backgroundColor: warnConfig.bg, borderColor: warnConfig.color }]}>

            <Text style={styles.warningIcon}>{warnConfig.icon}</Text>
            <Text style={[styles.warningLevel, { color: warnConfig.color }]}>
              {warningLevel}
            </Text>
            <Text style={styles.warningTitle}>EYES ON THE ROAD!</Text>
            <Text style={styles.warningMessage}>{warnConfig.message}</Text>
            <Text style={styles.warningReason}>{distractionReason}</Text>

            <View style={styles.warningStats}>
              <View style={styles.warningStat}>
                <Text style={[styles.warningStatValue, { color: warnConfig.color }]}>
                  {distractionCount}
                </Text>
                <Text style={styles.warningStatLabel}>Distractions</Text>
              </View>
              <View style={styles.warningStat}>
                <Text style={[styles.warningStatValue, { color: warnConfig.color }]}>
                  {distractionRate}
                </Text>
                <Text style={styles.warningStatLabel}>Per minute</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.warningBtn, { backgroundColor: warnConfig.color }]}
              onPress={dismissWarning}
            >
              <Text style={styles.warningBtnText}>I'm Focused Now ✓</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>

      {/* ── MAIN CAMERA CARD ── */}
      <View style={[
        styles.card,
        isDistracted && driveModeActive
          ? { borderColor: warnConfig.color }
          : {}
      ]}>

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>👁️ Attention Monitor</Text>
          <View style={[
            styles.statusBadge,
            !driveModeActive ? styles.badgeOff :
            isDistracted ? styles.badgeRed : styles.badgeGreen
          ]}>
            <Text style={styles.statusText}>
              {!driveModeActive ? 'STANDBY' :
               isDistracted ? '😴 DISTRACTED' : '👀 FOCUSED'}
            </Text>
          </View>
        </View>

        {/* Camera preview */}
        {driveModeActive ? (
          <View style={styles.cameraWrapper}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
            />

            {/* Face detection overlay */}
            {attentionData?.face_detected && (
              <View style={[
                styles.faceBox,
                { borderColor: isDistracted ? '#ff6b6b' : '#00ff87' }
              ]} />
            )}

            {/* Distracted overlay */}
            {isDistracted && (
              <Animated.View style={[
                styles.distractionOverlay,
                { opacity: pulseAnim }
              ]}>
                <Text style={styles.distractionIcon}>⚠️</Text>
                <Text style={styles.distractionLabel}>DISTRACTED</Text>
                <Text style={styles.distractionReason} numberOfLines={2}>
                  {distractionReason}
                </Text>
              </Animated.View>
            )}

            {/* Attentive indicator */}
            {!isDistracted && (
              <View style={styles.attentiveOverlay}>
                <Text style={styles.attentiveText}>👀 Monitoring</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.cameraOff}>
            <Text style={styles.cameraOffIcon}>📷</Text>
            <Text style={styles.cameraOffText}>
              Camera activates when Drive Mode is ON
            </Text>
          </View>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[
              styles.statValue,
              { color: distractionCount > 3 ? '#ff6b6b' : '#ffffff' }
            ]}>
              {distractionCount}
            </Text>
            <Text style={styles.statLabel}>Distractions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{distractionRate}</Text>
            <Text style={styles.statLabel}>Per min</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[
              styles.statValue,
              { color: isDistracted ? '#ff6b6b' : '#00ff87' }
            ]}>
              {isDistracted ? 'LOW' : 'HIGH'}
            </Text>
            <Text style={styles.statLabel}>Focus</Text>
          </View>
        </View>

        {/* Warning level indicator */}
        {driveModeActive && distractionCount > 0 && (
          <View style={[styles.levelBar, { backgroundColor: warnConfig.bg, borderColor: warnConfig.color }]}>
            <Text style={[styles.levelText, { color: warnConfig.color }]}>
              {warnConfig.icon} {warningLevel}: {warnConfig.message}
            </Text>
          </View>
        )}

        {/* History toggle */}
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>
            Recent Distractions ({distractionHistory.length})
          </Text>
          <View style={styles.historyButtons}>
            {distractionHistory.length > 0 && (
              <TouchableOpacity onPress={clearHistory}>
                <Text style={styles.clearBtn}>Clear</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setShowHistory(!showHistory)}
            >
              <Text style={styles.toggleBtn}>
                {showHistory ? 'Hide ▲' : 'Show ▼'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Distraction history list */}
        {showHistory && (
          distractionHistory.length === 0 ? (
            <Text style={styles.noHistory}>No distractions recorded ✅</Text>
          ) : (
            distractionHistory.slice(0, 5).map((item) => {
              const cfg = warningConfig[item.severity] || warningConfig.CAUTION;
              return (
                <View key={item.id} style={styles.historyRow}>
                  <Text style={styles.historyTime}>{item.time}</Text>
                  <Text style={styles.historyReason} numberOfLines={1}>
                    {item.reason}
                  </Text>
                  <View style={[styles.severityBadge, { borderColor: cfg.color }]}>
                    <Text style={[styles.severityText, { color: cfg.color }]}>
                      {item.severity}
                    </Text>
                  </View>
                </View>
              );
            })
          )
        )}

        <Text style={styles.hint}>
          {driveModeActive
            ? '📸 Analyzing every 1.5s · Phone vibrates on distraction'
            : 'Start Drive Mode to activate attention monitoring'}
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
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  cardTitle: {
    fontSize: 12, color: '#8892b0',
    textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  badgeGreen: { backgroundColor: '#0d2b1e', borderColor: '#00ff87' },
  badgeRed: { backgroundColor: '#2d0d0d', borderColor: '#ff6b6b' },
  badgeOff: { backgroundColor: '#161b22', borderColor: '#30363d' },
  statusText: { fontSize: 11, fontWeight: '700', color: '#ffffff' },
  cameraWrapper: {
    height: 180, borderRadius: 12,
    overflow: 'hidden', marginBottom: 14,
    position: 'relative',
  },
  camera: { flex: 1 },
  faceBox: {
    position: 'absolute',
    top: '20%', left: '25%',
    width: '50%', height: '60%',
    borderWidth: 2, borderRadius: 8,
  },
  distractionOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,107,107,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  distractionIcon: { fontSize: 28, marginBottom: 4 },
  distractionLabel: {
    color: '#ffffff', fontSize: 16,
    fontWeight: 'bold', letterSpacing: 2,
  },
  distractionReason: {
    color: '#ffffff', fontSize: 11,
    textAlign: 'center', marginTop: 4, paddingHorizontal: 8,
  },
  attentiveOverlay: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,255,135,0.2)',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  attentiveText: { fontSize: 11, color: '#00ff87' },
  cameraOff: {
    height: 120, backgroundColor: '#0d1117',
    borderRadius: 12, alignItems: 'center',
    justifyContent: 'center', marginBottom: 14,
    borderWidth: 1, borderColor: '#21262d',
  },
  cameraOffIcon: { fontSize: 32, marginBottom: 8 },
  cameraOffText: { fontSize: 13, color: '#484f58', textAlign: 'center' },
  statsRow: { flexDirection: 'row', marginBottom: 14 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: 22, fontWeight: 'bold',
    color: '#ffffff', marginBottom: 4,
  },
  statLabel: { fontSize: 11, color: '#8892b0' },
  statDivider: { width: 1, backgroundColor: '#21262d' },
  levelBar: {
    borderRadius: 8, padding: 10,
    marginBottom: 14, borderWidth: 1,
  },
  levelText: { fontSize: 12, textAlign: 'center', fontWeight: '600' },
  historyHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 8,
  },
  historyTitle: { fontSize: 12, color: '#8892b0' },
  historyButtons: { flexDirection: 'row', gap: 12 },
  clearBtn: { fontSize: 12, color: '#ff6b6b' },
  toggleBtn: { fontSize: 12, color: '#58a6ff' },
  noHistory: { fontSize: 13, color: '#484f58', textAlign: 'center', padding: 12 },
  historyRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#21262d',
  },
  historyTime: { fontSize: 11, color: '#484f58', width: 70 },
  historyReason: { flex: 1, fontSize: 12, color: '#8892b0', marginHorizontal: 8 },
  severityBadge: {
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6, borderWidth: 1,
  },
  severityText: { fontSize: 9, fontWeight: '700' },
  permText: { fontSize: 14, color: '#8892b0', marginBottom: 16, lineHeight: 20 },
  permBtn: {
    backgroundColor: '#0d2b1e', borderRadius: 10,
    padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#00ff87',
  },
  permBtnText: { fontSize: 14, color: '#00ff87', fontWeight: '600' },
  hint: { fontSize: 12, color: '#484f58', lineHeight: 18, marginTop: 8 },
  // Warning modal
  warningOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  warningBox: {
    borderRadius: 20, padding: 32,
    alignItems: 'center', width: '100%',
    borderWidth: 3,
  },
  warningIcon: { fontSize: 72, marginBottom: 12 },
  warningLevel: {
    fontSize: 14, fontWeight: '700',
    letterSpacing: 3, marginBottom: 8,
  },
  warningTitle: {
    fontSize: 26, fontWeight: 'bold',
    color: '#ffffff', letterSpacing: 1, marginBottom: 8,
  },
  warningMessage: {
    fontSize: 15, color: '#8892b0',
    textAlign: 'center', marginBottom: 8,
  },
  warningReason: {
    fontSize: 13, color: '#484f58',
    textAlign: 'center', marginBottom: 20, lineHeight: 20,
  },
  warningStats: {
    flexDirection: 'row', gap: 32, marginBottom: 24,
  },
  warningStat: { alignItems: 'center' },
  warningStatValue: { fontSize: 36, fontWeight: 'bold' },
  warningStatLabel: { fontSize: 12, color: '#8892b0', marginTop: 4 },
  warningBtn: {
    borderRadius: 12, paddingVertical: 16,
    paddingHorizontal: 40,
  },
  warningBtnText: {
    fontSize: 16, color: '#ffffff', fontWeight: 'bold',
  },
});