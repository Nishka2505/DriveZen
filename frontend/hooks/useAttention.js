import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL } from '../context/DriveContext';

// useAttention.js — Camera attention monitoring hook
//
// How it works:
// 1. Every 1.5 seconds capture a frame from the camera
// 2. Convert to base64 and send to POST /attention
// 3. If distracted → play alert sound + increment counter
// 4. If distracted 3 times in a row → trigger full screen warning
//
// This hook doesn't handle the camera itself —
// the CameraMonitor component does that.
// This hook just receives frames and sends them to the API.

export default function useAttention(driveModeActive) {

  const [isDistracted, setIsDistracted] = useState(false);
  const [distractionReason, setDistractionReason] = useState('');
  const [distractionCount, setDistractionCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [attentionData, setAttentionData] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Sound reference
  const alertSound = useRef(null);

  // Consecutive distraction counter
  const consecutiveDistractions = useRef(0);

  // Whether we're currently sending a frame
  const isSending = useRef(false);

  // ── LOAD ALERT SOUND ──────────────────────────────────
  useEffect(() => {
    loadSound();
    return () => {
      if (alertSound.current) {
        alertSound.current.unloadAsync();
      }
    };
  }, []);

  const loadSound = async () => {
    try {
      // Use a system sound — works without audio files
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/buttons/sounds/beep-01a.mp3' },
        { shouldPlay: false }
      );
      alertSound.current = sound;
    } catch (error) {
      console.log('Could not load alert sound:', error);
    }
  };

  const playAlert = async () => {
    try {
      if (alertSound.current) {
        await alertSound.current.replayAsync();
      }
    } catch (error) {
      console.log('Could not play alert:', error);
    }
  };

  // ── ANALYZE FRAME ──────────────────────────────────────
  // This is called by the CameraMonitor component
  // with a base64 encoded frame
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
        setIsDistracted(true);
        setDistractionReason(data.reason || 'Distraction detected');
        setDistractionCount(prev => prev + 1);

        // Play alert sound
        await playAlert();

        // Show full screen warning after 3 consecutive distractions
        if (consecutiveDistractions.current >= 3) {
          setShowWarning(true);
          consecutiveDistractions.current = 0;
        }

      } else {
        // Attentive — reset counters
        consecutiveDistractions.current = 0;
        setIsDistracted(false);
        setDistractionReason('');
        setShowWarning(false);
      }

    } catch (error) {
      // Silently fail — don't interrupt driving for API errors
      console.log('Attention API error:', error.message);
    } finally {
      isSending.current = false;
    }
  }, [driveModeActive]);

  // ── DISMISS WARNING ────────────────────────────────────
  const dismissWarning = useCallback(() => {
    setShowWarning(false);
    consecutiveDistractions.current = 0;
  }, []);

  // ── RESET WHEN DRIVE MODE TURNS OFF ───────────────────
  useEffect(() => {
    if (!driveModeActive) {
      setIsDistracted(false);
      setShowWarning(false);
      setDistractionCount(0);
      consecutiveDistractions.current = 0;
    } else {
      setIsMonitoring(true);
    }
  }, [driveModeActive]);

  return {
    isDistracted,
    distractionReason,
    distractionCount,
    showWarning,
    dismissWarning,
    attentionData,
    isMonitoring: driveModeActive,
    analyzeFrame,
  };
}