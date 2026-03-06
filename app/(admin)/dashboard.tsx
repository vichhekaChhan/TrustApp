import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { sellers, products as productsApi } from '../../lib/client';
import { useRouter } from 'expo-router';

interface AdminStats {
  pendingSellers: number;
  approvedSellers: number;
  pendingProducts: number;
  approvedProducts: number;
  totalBuyers: number;
}

export default function AdminDashboardScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    pendingSellers: 0,
    approvedSellers: 0,
    pendingProducts: 0,
    approvedProducts: 0,
    totalBuyers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [allSellers, allProducts] = await Promise.all([
        sellers.getAll(),
        productsApi.getAll(),
      ]);
      setStats({
        pendingSellers: allSellers.filter(s => s.status === 'pending').length,
        approvedSellers: allSellers.filter(s => s.status === 'approved').length,
        pendingProducts: allProducts.filter(p => p.status === 'pending').length,
        approvedProducts: allProducts.filter(p => p.status === 'approved').length,
        totalBuyers: 1,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#7c3aed" style={{ flex: 1, marginTop: 80 }} />;

  const StatCard = ({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) => (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.greeting}>
          <Text style={styles.greetText}>🛡️ Admin Panel</Text>
          <Text style={styles.greetSub}>Welcome, {profile?.full_name}</Text>
        </View>

        {/* Pending alerts */}
        {(stats.pendingSellers > 0 || stats.pendingProducts > 0) && (
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>⚠️ Action Required</Text>
            {stats.pendingSellers > 0 && (
              <Text style={styles.alertText}>• {stats.pendingSellers} seller verification(s) pending</Text>
            )}
            {stats.pendingProducts > 0 && (
              <Text style={styles.alertText}>• {stats.pendingProducts} product review(s) pending</Text>
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>Sellers</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Pending" value={stats.pendingSellers} color="#92400e" bg="#fef3c7" />
          <StatCard label="Approved" value={stats.approvedSellers} color="#15803d" bg="#dcfce7" />
        </View>

        <Text style={styles.sectionTitle}>Products</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Pending" value={stats.pendingProducts} color="#92400e" bg="#fef3c7" />
          <StatCard label="Approved" value={stats.approvedProducts} color="#15803d" bg="#dcfce7" />
        </View>

        <Text style={styles.sectionTitle}>Platform</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Total Buyers" value={stats.totalBuyers} color="#7c3aed" bg="#f5f3ff" />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.navigate('/(admin)/sellers')}>
            <Text style={styles.actionIcon}>🪪</Text>
            <Text style={styles.actionText}>Review Sellers</Text>
            {stats.pendingSellers > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{stats.pendingSellers}</Text></View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.navigate('/(admin)/products')}>
            <Text style={styles.actionIcon}>📦</Text>
            <Text style={styles.actionText}>Review Products</Text>
            {stats.pendingProducts > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{stats.pendingProducts}</Text></View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { padding: 20 },
  greeting: { marginBottom: 20 },
  greetText: { fontSize: 26, fontWeight: '700', color: '#111827' },
  greetSub: { color: '#6b7280', fontSize: 14, marginTop: 2 },
  alertBox: { backgroundColor: '#fef3c7', borderRadius: 12, padding: 14, marginBottom: 20 },
  alertTitle: { fontWeight: '700', color: '#92400e', fontSize: 15, marginBottom: 6 },
  alertText: { color: '#92400e', fontSize: 13, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 14, padding: 20, alignItems: 'center' },
  statValue: { fontSize: 32, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  actionsGrid: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
