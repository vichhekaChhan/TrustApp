import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function BuyerLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#f3f4f6', height: 60 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: '#1a73e8' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Marketplace',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarLabel: 'Search',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔍</Text>,
        }}
      />
      <Tabs.Screen
        name="product/[id]"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
