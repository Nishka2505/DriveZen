import React, { createContext, useContext, useState } from 'react';

// DriveContext.js — Global state + API connection
//
// New today:
// We add the API_URL here so every part of the app
// knows where the Flask backend is running.
//
// IMPORTANT: Replace YOUR_PC_IP with your actual IP address!
// Run ipconfig in PowerShell and look for IPv4 Address
// Example: if your IP is 192.168.1.5, change it to:
// export const API_URL = 'http://192.168.1.5:5000';

export const API_URL = 'https://drivezen.onrender.com';

const DriveContext = createContext();

export function DriveProvider({ children }) {

  //Drive Mode
  const [driveModeActive, setDriveModeActive] = useState(false);

  //ML prediction result from backend
  const [currentActivity, setCurrentActivity] = useState('UNKNOWN');
  const [activityConfidence, setActivityConfidence] = useState(0);

  //Speed from GPS
  const [currentSpeed, setCurrentSpeed] = useState(0);

  //Sensor data
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });

  //API connection status
  const [apiConnected, setApiConnected] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [lastPrediction, setLastPrediction] = useState(null);

  //Score
  const [drivingScore, setDrivingScore] = useState(100);
  const [sessionHistory, setSessionHistory] = useState([]);

  const addScore = (points) => {
    setDrivingScore((prev) => Math.max(0, Math.min(100, prev + points)));
  };

  const saveSession = (session) => {
    setSessionHistory((prev) => [session, ...prev]);
  };

  return (
    <DriveContext.Provider value={{
      driveModeActive, setDriveModeActive,
      currentActivity, setCurrentActivity,
      activityConfidence, setActivityConfidence,
      currentSpeed, setCurrentSpeed,
      accelerometerData, setAccelerometerData,
      gyroscopeData, setGyroscopeData,
      apiConnected, setApiConnected,
      apiError, setApiError,
      lastPrediction, setLastPrediction,
      drivingScore, addScore,
      sessionHistory, saveSession,
    }}>
      {children}
    </DriveContext.Provider>
  );
}

export function useDrive() {
  return useContext(DriveContext);
}