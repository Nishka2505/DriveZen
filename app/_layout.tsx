import { Stack } from 'expo-router';
import { DriveProvider } from '../frontend/context/DriveContext';

// _layout.tsx — Root layout
// Wraps the entire app in DriveProvider so all screens
// can access global Drive Mode state

export default function RootLayout() {
  return (
    <DriveProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    </DriveProvider>
  );
}