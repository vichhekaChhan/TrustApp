import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function SellerLayout() {
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
        name="dashboard"
        options={{
          title: 'Seller Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'My Products',
          tabBarLabel: 'Products',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📦</Text>,
        }}
      />
      <Tabs.Screen
        name="add-product"
        options={{
          title: 'Add Product',
          tabBarLabel: 'Add',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>➕</Text>,
        }}
      />
      <Tabs.Screen
        name="verification"
        options={{
          title: 'Verification',
          tabBarLabel: 'Verify',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🪪</Text>,
        }}
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
