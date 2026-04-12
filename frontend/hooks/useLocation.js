import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

export default function useLocation() {
  const [speed, setSpeed] = useState(0);
  const [coords, setCoords] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('pending');
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const locationSubscription = useRef(null);

  const startTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setPermissionStatus('denied');
        setError('Location permission denied.');
        return;
      }

      setPermissionStatus('granted');
      setIsTracking(true);

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          const speedMs = location.coords.speed;
          const speedKmh = speedMs > 0 ? speedMs * 3.6 : 0;
          setSpeed(Math.round(speedKmh * 10) / 10);
          setCoords({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
          });
        }
      );
    } catch (err) {
      setError('Failed to start GPS: ' + err.message);
      setIsTracking(false);
    }
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setIsTracking(false);
    setSpeed(0);
  };

  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []);

  return {
    speed,
    coords,
    permissionStatus,
    isTracking,
    error,
    startTracking,
    stopTracking,
  };
}