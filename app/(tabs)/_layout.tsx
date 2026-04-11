import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#161b22',
          borderTopColor: '#21262d',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#00ff87',
        tabBarInactiveTintColor: '#484f58',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🚗</Text>,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Score',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏆</Text>,
        }}
      />
    </Tabs>
  );
}