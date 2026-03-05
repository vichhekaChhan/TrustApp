import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#f3f4f6', height: 60 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: '#7c3aed' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Admin Panel',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🛡️</Text>,
        }}
      />
      <Tabs.Screen
        name="sellers"
        options={{
          title: 'Seller Requests',
          tabBarLabel: 'Sellers',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🪪</Text>,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Product Reviews',
          tabBarLabel: 'Products',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📦</Text>,
        }}
      />
      <Tabs.Screen name="seller/[id]" options={{ href: null }} />
      <Tabs.Screen name="product/[id]" options={{ href: null }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Admin Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
