import { createContext, useContext, useState } from 'react';

// DriveContext.js — Global state for the entire app.
//
// Think of this like a whiteboard in the middle of the room.
// Every screen can read from it and write to it.
//
// We store everything here:
// - Sensor readings (accelerometer, gyroscope)
// - Drive Mode status
// - Current speed
// - Safety score
//
// Any screen that needs this data just calls useDrive()
// and gets instant access — no need to pass props around.

const DriveContext = createContext();

export function DriveProvider({ children }) {

  // ── DRIVE MODE ──────────────────────────────────────
  const [driveModeActive, setDriveModeActive] = useState(false);

  // ── ACTIVITY ─────────────────────────────────────────
  // What is the user currently doing?
  // Possible values: 'UNKNOWN', 'SITTING', 'WALKING', 'DRIVING'
  const [currentActivity, setCurrentActivity] = useState('UNKNOWN');

  // ── SPEED ─────────────────────────────────────────────
  // GPS speed in km/h — updated live on Day 4
  const [currentSpeed, setCurrentSpeed] = useState(0);

  // ── SENSOR DATA ───────────────────────────────────────
  // Accelerometer measures how fast the phone is accelerating
  // in 3 directions: x (left/right), y (up/down), z (forward/back)
  const [accelerometerData, setAccelerometerData] = useState({
    x: 0, y: 0, z: 0
  });

  // Gyroscope measures how fast the phone is ROTATING
  // in 3 directions: x (tilting), y (turning), z (spinning)
  const [gyroscopeData, setGyroscopeData] = useState({
    x: 0, y: 0, z: 0
  });

  // ── SCORE ─────────────────────────────────────────────
  const [drivingScore, setDrivingScore] = useState(100);
  const [sessionHistory, setSessionHistory] = useState([]);

  // Add or subtract points from driving score
  const addScore = (points) => {
    setDrivingScore((prev) => Math.max(0, Math.min(100, prev + points)));
  };

  // Save a completed driving session
  const saveSession = (session) => {
    setSessionHistory((prev) => [session, ...prev]);
  };

  return (
    <DriveContext.Provider
      value={{
        // Drive Mode
        driveModeActive,
        setDriveModeActive,

        // Activity
        currentActivity,
        setCurrentActivity,

        // Speed
        currentSpeed,
        setCurrentSpeed,

        // Sensors
        accelerometerData,
        setAccelerometerData,
        gyroscopeData,
        setGyroscopeData,

        // Score
        drivingScore,
        addScore,
        sessionHistory,
        saveSession,
      }}
    >
      {children}
    </DriveContext.Provider>
  );
}

// Custom hook — instead of writing useContext(DriveContext) everywhere
// just write useDrive() — much cleaner
export function useDrive() {
  return useContext(DriveContext);
}