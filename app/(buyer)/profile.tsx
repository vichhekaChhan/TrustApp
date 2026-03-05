import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export default function BuyerProfileScreen() {
  const { profile, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.full_name || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.full_name}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🛒 Buyer</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{profile?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Member Since</Text>
          <Text style={styles.infoValue}>
            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 34, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  email: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  badge: { backgroundColor: '#eff6ff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  badgeText: { color: '#1a73e8', fontWeight: '700', fontSize: 13 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoLabel: { fontSize: 14, color: '#6b7280' },
  infoValue: { fontSize: 14, color: '#111827', fontWeight: '500' },
  signOutBtn: { backgroundColor: '#fee2e2', borderRadius: 12, padding: 16, alignItems: 'center' },
  signOutText: { color: '#b91c1c', fontWeight: '700', fontSize: 16 },
});
