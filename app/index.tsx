import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a73e8' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/login" />;
  if (profile?.role === 'admin') return <Redirect href="/(admin)/dashboard" />;
  if (profile?.role === 'seller') return <Redirect href="/(seller)/dashboard" />;
  return <Redirect href="/(buyer)/home" />;
}
