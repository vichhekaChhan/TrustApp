import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatusBadge from '../../components/StatusBadge';
import { sellers } from '../../lib/client';
import { SellerProfile } from '../../lib/types';

const FILTERS = ['all', 'pending', 'approved', 'rejected'] as const;
type Filter = typeof FILTERS[number];

export default function AdminSellersScreen() {
  const router = useRouter();
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [filter, setFilter] = useState<Filter>('pending');
  const [loading, setLoading] = useState(true);

  const fetchSellers = async () => {
    setLoading(true);
    const allSellers = await sellers.getAll();
    const data = filter === 'all' ? allSellers : allSellers.filter(s => s.status === filter);
    setSellers(data);
    setLoading(false);
  };

  useEffect(() => { fetchSellers(); }, [filter]);

  const renderItem = ({ item }: { item: SellerProfile }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/(admin)/seller/[id]', params: { id: item.id } })}
      activeOpacity={0.85}
    >
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.full_name || 'S')[0].toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.full_name}</Text>
          {item.business_name && <Text style={styles.biz}>🏪 {item.business_name}</Text>}
          <Text style={styles.date}>Submitted: {new Date(item.submitted_at).toLocaleDateString()}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      <View style={styles.reviewBtn}>
        <Text style={styles.reviewText}>Tap to review →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Filter tabs */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.filterTabActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 60 }} />
      ) : sellers.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No {filter} sellers</Text>
        </View>
      ) : (
        <FlatList
          data={sellers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  filters: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterTab: { flex: 1, backgroundColor: '#fff', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  filterTabActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  filterTextActive: { color: '#fff' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  biz: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  date: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  reviewBtn: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10, alignItems: 'flex-end' },
  reviewText: { color: '#7c3aed', fontWeight: '600', fontSize: 13 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});
