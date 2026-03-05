import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function RootNavigator() {
  const { session, profile, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session) {
      if (!inAuthGroup) router.replace('/(auth)/login');
    } else if (profile) {
      if (inAuthGroup || !segments[0]) {
        if (profile.role === 'admin') router.replace('/(admin)/dashboard');
        else if (profile.role === 'seller') router.replace('/(seller)/dashboard');
        else router.replace('/(buyer)/home');
      }
    }
  }, [session, profile, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a73e8' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
