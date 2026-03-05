import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { UserRole } from '../../lib/types';

const ROLES: { label: string; value: UserRole; icon: string; desc: string }[] = [
  { label: 'Buyer', value: 'buyer', icon: '🛒', desc: 'Browse and buy verified products' },
  { label: 'Seller', value: 'seller', icon: '🏪', desc: 'Sell products after verification' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      setLoading(false);
      Alert.alert('Registration Failed', error?.message ?? 'Unknown error');
      return;
    }
    // Create profile in profiles table
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      full_name: fullName,
      role,
    });
    setLoading(false);
    if (profileError) {
      Alert.alert('Profile Error', profileError.message);
      return;
    }
    Alert.alert('Success!', 'Account created. Please check your email to confirm.', [
      { text: 'OK', onPress: () => router.replace('/(auth)/login') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>🛡️ TrustMarket</Text>
            <Text style={styles.tagline}>Join a trusted marketplace</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>

            <Text style={styles.label}>I want to join as</Text>
            <View style={styles.roleRow}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.roleCard, role === r.value && styles.roleCardActive]}
                  onPress={() => setRole(r.value)}
                >
                  <Text style={styles.roleIcon}>{r.icon}</Text>
                  <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>{r.label}</Text>
                  <Text style={styles.roleDesc}>{r.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="John Doe"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Min 6 characters"
              secureTextEntry
              placeholderTextColor="#9ca3af"
            />

            <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
              <Text style={styles.btnText}>{loading ? 'Creating account…' : 'Create Account'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a73e8' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 36, fontWeight: '800', color: '#fff' },
  tagline: { color: '#dbeafe', fontSize: 14, marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  roleCardActive: { borderColor: '#1a73e8', backgroundColor: '#eff6ff' },
  roleIcon: { fontSize: 28, marginBottom: 4 },
  roleLabel: { fontWeight: '700', fontSize: 14, color: '#374151' },
  roleLabelActive: { color: '#1a73e8' },
  roleDesc: { fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#111827',
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  btn: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { textAlign: 'center', color: '#6b7280', fontSize: 14 },
  linkBold: { color: '#1a73e8', fontWeight: '600' },
});
