import { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL } from '../context/DriveContext';

// useMLPrediction.js — Sends sensor data to Flask API
// and returns the ML prediction every 2 seconds.
//
// How it works:
// 1. Every 2 seconds, take current sensor readings
// 2. Send them as JSON to POST /predict
// 3. Get back { activity, confidence, is_driving }
// 4. Return these values to the HomeScreen
//
// We use setInterval to repeat this every 2 seconds.
// useRef stores the interval so we can cancel it later.

export default function useMLPrediction(accelData, gyroData, speed) {

  const [prediction, setPrediction] = useState({
    activity: 'UNKNOWN',
    confidence: 0,
    is_driving: false,
    all_probabilities: null,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictionCount, setPredictionCount] = useState(0);

  const intervalRef = useRef(null);

  // ── SEND DATA TO API ────────────────────────────────────
  const sendPrediction = useCallback(async () => {
    // Don't send if sensor data is all zeros (not ready yet)
    if (accelData.x === 0 && accelData.y === 0 && accelData.z === 0) {
      return;
    }

    setIsLoading(true);

    try {
      // fetch() is JavaScript's built-in HTTP request function
      // We send a POST request with sensor data as JSON body
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accel_x: accelData.x,
          accel_y: accelData.y,
          accel_z: accelData.z,
          gyro_x: gyroData.x,
          gyro_y: gyroData.y,
          gyro_z: gyroData.z,
          speed: speed,
        }),
        // Timeout after 3 seconds — don't wait forever
        
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Parse the JSON response from Flask
      const data = await response.json();

      // Update prediction state
      setPrediction({
        activity: data.activity,
        confidence: data.confidence,
        is_driving: data.is_driving,
        all_probabilities: data.all_probabilities,
        inference_ms: data.inference_ms,
      });

      setIsConnected(true);
      setError(null);
      setPredictionCount(prev => prev + 1);

    } catch (err) {
      setIsConnected(false);

      // Different error messages based on error type
      if (err.name === 'TimeoutError') {
        setError('Server timeout — is Flask running?');
      } else if (err.message.includes('Network request failed')) {
        setError(`Cannot reach server.\nCheck IP: ${API_URL}`);
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accelData, gyroData, speed]);

  // ── START POLLING EVERY 2 SECONDS ──────────────────────
  useEffect(() => {
    // Send immediately on first load
    sendPrediction();

    // Then send every 2000ms (2 seconds)
    intervalRef.current = setInterval(sendPrediction, 2000);

    // Cleanup: stop polling when screen unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sendPrediction]);

  return {
    prediction,
    isConnected,
    isLoading,
    error,
    predictionCount,
  };
}