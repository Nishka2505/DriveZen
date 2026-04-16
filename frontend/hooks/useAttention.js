import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL } from '../context/DriveContext';

// useAttention.js — Day 12: Improved attention monitoring
//
// New today:
// - Haptic feedback (phone vibrates when distracted)
// - Distraction history log with timestamps
// - Distraction rate calculation (distractions per minute)
// - Smarter consecutive detection with cooldown
// - Warning level system: CAUTION → WARNING → CRITICAL

export default function useAttention(driveModeActive) {

  const [isDistracted, setIsDistracted] = useState(false);
  const [distractionReason, setDistractionReason] = useState('');
  const [distractionCount, setDistractionCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningLevel, setWarningLevel] = useState('CAUTION');
  const [attentionData, setAttentionData] = useState(null);
  const [distractionHistory, setDistractionHistory] = useState([]);
  const [distractionRate, setDistractionRate] = useState(0);

  // Tracking refs
  const consecutiveDistractions = useRef(0);
  const consecutiveAttentive = useRef(0);
  const isSending = useRef(false);
  const sessionStartTime = useRef(null);
  const totalDistractions = useRef(0);
  const lastAlertTime = useRef(0);
  const ALERT_COOLDOWN = 3000; // 3 seconds between alerts

  // Start session timer when Drive Mode turns ON
  useEffect(() => {
    if (driveModeActive) {
      sessionStartTime.current = Date.now();
    } else {
      // Reset everything when Drive Mode turns OFF
      setIsDistracted(false);
      setShowWarning(false);
      setWarningLevel('CAUTION');
      setDistractionCount(0);
      consecutiveDistractions.current = 0;
      consecutiveAttentive.current = 0;
      totalDistractions.current = 0;
      sessionStartTime.current = null;
    }
  }, [driveModeActive]);

  // ── CALCULATE DISTRACTION RATE ─────────────────────────
  // How many distractions per minute — lower is safer
  useEffect(() => {
    if (!sessionStartTime.current || totalDistractions.current === 0) {
      setDistractionRate(0);
      return;
    }
    const minutesElapsed = (Date.now() - sessionStartTime.current) / 60000;
    if (minutesElapsed > 0) {
      setDistractionRate(
        Math.round((totalDistractions.current / minutesElapsed) * 10) / 10
      );
    }
  }, [distractionCount]);

  // ── DETERMINE WARNING LEVEL ────────────────────────────
  const getWarningLevel = (count) => {
    if (count >= 5) return 'CRITICAL';
    if (count >= 3) return 'WARNING';
    return 'CAUTION';
  };

  // ── TRIGGER HAPTIC ALERT ───────────────────────────────
  const triggerHapticAlert = async (level) => {
    try {
      const now = Date.now();
      if (now - lastAlertTime.current < ALERT_COOLDOWN) return;
      lastAlertTime.current = now;

      switch (level) {
        case 'CRITICAL':
          // Heavy vibration for critical
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
          break;
        case 'WARNING':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          );
          break;
        default:
          await Haptics.impactAsync(
            Haptics.ImpactFeedbackStyle.Medium
          );
      }
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  // ── ANALYZE FRAME ──────────────────────────────────────
  const analyzeFrame = useCallback(async (base64Frame) => {
    if (!driveModeActive || isSending.current) return;
    isSending.current = true;

    try {
      const response = await fetch(`${API_URL}/attention`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frame: base64Frame }),
      });

      if (!response.ok) return;

      const data = await response.json();
      setAttentionData(data);

      if (data.distracted) {
        consecutiveDistractions.current += 1;
        consecutiveAttentive.current = 0;

        setIsDistracted(true);
        setDistractionReason(data.reason || 'Distraction detected');

        // Only count as a new distraction after 2 consecutive frames
        // Avoids counting a single brief glance as multiple distractions
        if (consecutiveDistractions.current === 2) {
          totalDistractions.current += 1;
          const newCount = totalDistractions.current;
          setDistractionCount(newCount);

          // Add to history
          const historyEntry = {
            id: Date.now().toString(),
            time: new Date().toLocaleTimeString(),
            reason: data.reason || 'Distraction detected',
            severity: getWarningLevel(newCount),
          };
          setDistractionHistory(prev => [historyEntry, ...prev.slice(0, 9)]);

          // Determine warning level
          const level = getWarningLevel(newCount);
          setWarningLevel(level);

          // Haptic alert
          await triggerHapticAlert(level);

          // Show full screen warning at WARNING and CRITICAL levels
          if (consecutiveDistractions.current >= 3) {
            setShowWarning(true);
          }
        }

      } else {
        // Attentive
        consecutiveAttentive.current += 1;
        consecutiveDistractions.current = 0;

        // Only mark as attentive after 2 consecutive attentive frames
        if (consecutiveAttentive.current >= 2) {
          setIsDistracted(false);
          setDistractionReason('');
        }

        // Auto-dismiss warning after 5 attentive frames
        if (consecutiveAttentive.current >= 5) {
          setShowWarning(false);
        }
      }

    } catch (error) {
      console.log('Attention API error:', error.message);
    } finally {
      isSending.current = false;
    }
  }, [driveModeActive]);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
    consecutiveDistractions.current = 0;
  }, []);

  const clearHistory = useCallback(() => {
    setDistractionHistory([]);
    setDistractionCount(0);
    totalDistractions.current = 0;
  }, []);

  return {
    isDistracted,
    distractionReason,
    distractionCount,
    showWarning,
    warningLevel,
    dismissWarning,
    attentionData,
    isMonitoring: driveModeActive,
    analyzeFrame,
    distractionHistory,
    distractionRate,
    clearHistory,
  };
}