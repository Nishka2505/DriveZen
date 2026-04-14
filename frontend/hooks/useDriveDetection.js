import { useCallback, useEffect, useRef, useState } from 'react';

// useDriveDetection.js — Smart Drive Mode auto-detection
//
// The problem with simple speed detection (Day 4):
// If you're a passenger in a car, speed > 15 km/h but you're not driving.
// The ML model alone can also make occasional wrong predictions.
//
// Our solution — COMBINED detection:
// We require BOTH conditions to be true for several seconds
// before activating Drive Mode. This eliminates false positives.
//
// Rules:
// ✅ Activate Drive Mode when:
//    - ML model says 'driving' with > 70% confidence
//    - AND GPS speed > 15 km/h
//    - AND both conditions have been true for 5+ seconds
//
// ✅ Deactivate Drive Mode when:
//    - Speed drops below 5 km/h for 10+ seconds
//    - OR ML model says 'sitting' or 'walking' for 10+ seconds

export default function useDriveDetection(prediction, speed, manualOverride) {

  // Whether Drive Mode is active
  const [driveModeActive, setDriveModeActive] = useState(false);

  // How long current drive has been going (seconds)
  const [driveSessionSeconds, setDriveSessionSeconds] = useState(0);

  // Detection state — what the system currently thinks
  const [detectionState, setDetectionState] = useState('MONITORING');
  // Possible states:
  // 'MONITORING'  — watching but not driving
  // 'CONFIRMING'  — looks like driving, waiting to confirm
  // 'DRIVING'     — confirmed driving
  // 'STOPPING'    — was driving, checking if actually stopped

  // Confidence counter — how many consecutive detections say driving
  // We need 3 consecutive detections (3 × 2s = 6 seconds) to confirm
  const drivingConsecutiveCount = useRef(0);
  const stoppingConsecutiveCount = useRef(0);

  // Session timer
  const sessionTimerRef = useRef(null);
  const sessionStartTime = useRef(null);

  // Track completed sessions
  const [completedSessions, setCompletedSessions] = useState([]);

  // ── DETECTION LOGIC ────────────────────────────────────
  useEffect(() => {
    const mlSaysDriving = prediction.activity === 'driving' &&
                          prediction.confidence > 0.70;
    const speedSaysDriving = speed >= 15;
    const isDrivingSignal = mlSaysDriving && speedSaysDriving;

    const mlSaysStopped = prediction.activity !== 'driving';
    const speedSaysStopped = speed < 5;
    const isStoppingSignal = mlSaysStopped || speedSaysStopped;

    if (!driveModeActive) {
      // ── NOT CURRENTLY DRIVING ──────────────────────────
      if (isDrivingSignal) {
        // Increment consecutive driving count
        drivingConsecutiveCount.current += 1;
        stoppingConsecutiveCount.current = 0;

        if (drivingConsecutiveCount.current >= 3) {
          // 3 consecutive detections = confirmed driving!
          console.log('🚗 Drive Mode AUTO-ACTIVATED');
          setDriveModeActive(true);
          setDetectionState('DRIVING');
          drivingConsecutiveCount.current = 0;
          sessionStartTime.current = Date.now();

          // Start session timer
          sessionTimerRef.current = setInterval(() => {
            setDriveSessionSeconds(prev => prev + 1);
          }, 1000);

        } else {
          // Still confirming — 1 or 2 detections so far
          setDetectionState('CONFIRMING');
        }

      } else {
        // Reset counter if signal disappears
        drivingConsecutiveCount.current = 0;
        setDetectionState('MONITORING');
      }

    } else {
      // ── CURRENTLY DRIVING ─────────────────────────────
      if (isStoppingSignal) {
        stoppingConsecutiveCount.current += 1;
        drivingConsecutiveCount.current = 0;
        setDetectionState('STOPPING');

        if (stoppingConsecutiveCount.current >= 5) {
          // 5 consecutive stop signals = confirmed stopped
          console.log('🛑 Drive Mode AUTO-DEACTIVATED');

          // Save the completed session
          const sessionDuration = driveSessionSeconds;
          setCompletedSessions(prev => [{
            date: new Date().toLocaleTimeString(),
            duration: sessionDuration,
            score: sessionDuration > 60 ? 10 : 5, // bonus for longer drives
          }, ...prev.slice(0, 9)]); // keep last 10

          setDriveModeActive(false);
          setDetectionState('MONITORING');
          stoppingConsecutiveCount.current = 0;
          setDriveSessionSeconds(0);
          sessionStartTime.current = null;

          // Stop session timer
          if (sessionTimerRef.current) {
            clearInterval(sessionTimerRef.current);
            sessionTimerRef.current = null;
          }
        }
      } else {
        // Still driving
        stoppingConsecutiveCount.current = 0;
        setDetectionState('DRIVING');
      }
    }
  }, [prediction, speed]);

  // ── MANUAL OVERRIDE ────────────────────────────────────
  // Allow user to manually toggle Drive Mode
  // This overrides the auto-detection
  const toggleDriveMode = useCallback(() => {
    if (driveModeActive) {
      // Manual deactivation
      setDriveModeActive(false);
      setDetectionState('MONITORING');
      setDriveSessionSeconds(0);
      drivingConsecutiveCount.current = 0;
      stoppingConsecutiveCount.current = 0;

      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    } else {
      // Manual activation
      setDriveModeActive(true);
      setDetectionState('DRIVING');
      sessionStartTime.current = Date.now();

      sessionTimerRef.current = setInterval(() => {
        setDriveSessionSeconds(prev => prev + 1);
      }, 1000);
    }
  }, [driveModeActive]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, []);

  // ── FORMAT SESSION TIME ────────────────────────────────
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    driveModeActive,
    toggleDriveMode,
    driveSessionSeconds,
    driveSessionFormatted: formatTime(driveSessionSeconds),
    detectionState,
    completedSessions,
    drivingConfidence: drivingConsecutiveCount.current,
  };
}