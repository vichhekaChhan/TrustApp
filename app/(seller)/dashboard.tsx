import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { SellerProfile } from '../../lib/types';
import { useRouter } from 'expo-router';

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export default function SellerDashboardScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      const [{ data: sp }, { data: products }] = await Promise.all([
        supabase.from('seller_profiles').select('*').eq('user_id', profile.id).single(),
        supabase.from('products').select('status').eq('seller_id',
          (await supabase.from('seller_profiles').select('id').eq('user_id', profile.id).single()).data?.id ?? ''
        ),
      ]);
      setSellerProfile(sp);
      if (products) {
        const st = { total: products.length, approved: 0, pending: 0, rejected: 0 };
        products.forEach((p) => { st[p.status as keyof typeof st]++; });
        setStats(st);
      }
      setLoading(false);
    })();
  }, [profile]);

  if (loading) return <ActivityIndicator size="large" color="#1a73e8" style={{ flex: 1, marginTop: 80 }} />;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetText}>👋 Hello, {profile?.full_name?.split(' ')[0]}</Text>
          <Text style={styles.greetSub}>Manage your store below</Text>
        </View>

        {/* Verification Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🪪 Seller Verification</Text>
          {sellerProfile ? (
            <View style={styles.verifyRow}>
              <View>
                <Text style={styles.verifyName}>{sellerProfile.business_name || sellerProfile.full_name}</Text>
                <Text style={styles.verifyDate}>
                  Submitted: {new Date(sellerProfile.submitted_at).toLocaleDateString()}
                </Text>
                {sellerProfile.admin_notes && (
                  <Text style={styles.adminNote}>📝 Admin: {sellerProfile.admin_notes}</Text>
                )}
              </View>
              <StatusBadge status={sellerProfile.status} />
            </View>
          ) : (
            <TouchableOpacity style={styles.verifyBtn} onPress={() => router.navigate('/(seller)/verification')}>
              <Text style={styles.verifyBtnText}>Submit Verification Documents →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Product Overview</Text>
        <View style={styles.statsGrid}>
          {[
            { label: 'Total', value: stats.total, color: '#1a73e8', bg: '#eff6ff' },
            { label: 'Approved', value: stats.approved, color: '#15803d', bg: '#dcfce7' },
            { label: 'Pending', value: stats.pending, color: '#92400e', bg: '#fef3c7' },
            { label: 'Rejected', value: stats.rejected, color: '#b91c1c', bg: '#fee2e2' },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: s.color }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.navigate('/(seller)/add-product')}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Add Product</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.navigate('/(seller)/products')}>
            <Text style={styles.actionIcon}>📦</Text>
            <Text style={styles.actionText}>My Products</Text>
          </TouchableOpacity>
        </View>

        {sellerProfile?.status !== 'approved' && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              ⚠️ Your seller account must be approved before you can add products.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { padding: 20 },
  greeting: { marginBottom: 20 },
  greetText: { fontSize: 24, fontWeight: '700', color: '#111827' },
  greetSub: { color: '#6b7280', fontSize: 14, marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 12 },
  verifyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  verifyName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  verifyDate: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  adminNote: { fontSize: 12, color: '#92400e', marginTop: 4 },
  verifyBtn: { backgroundColor: '#1a73e8', borderRadius: 10, padding: 12, alignItems: 'center' },
  verifyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, minWidth: '44%', borderRadius: 14, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  actionsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  warning: { backgroundColor: '#fef3c7', borderRadius: 12, padding: 14 },
  warningText: { color: '#92400e', fontSize: 13 },
});
