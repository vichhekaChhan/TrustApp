import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatusBadge from '../../components/StatusBadge';
import { products as productsApi } from '../../lib/client';
import { Product } from '../../lib/types';

const FILTERS = ['all', 'pending', 'approved', 'rejected'] as const;
type Filter = typeof FILTERS[number];

export default function AdminProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<Filter>('pending');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const allProducts = await productsApi.getAll();
    const data = filter === 'all' ? allProducts : allProducts.filter(p => p.status === filter);
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [filter]);

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/(admin)/product/[id]', params: { id: item.id } })}
      activeOpacity={0.85}
    >
      <View style={styles.row}>
        {item.images?.[0] ? (
          <Image source={{ uri: item.images[0] }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Text style={{ fontSize: 24 }}>📦</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
          <Text style={styles.seller}>
            by {item.seller?.business_name || item.seller?.full_name || 'Unknown Seller'}
          </Text>
          <StatusBadge status={item.status} />
        </View>
      </View>
      <View style={styles.reviewBtn}>
        <Text style={styles.reviewText}>Tap to review →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
      ) : products.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No {filter} products</Text>
        </View>
      ) : (
        <FlatList
          data={products}
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
  row: { flexDirection: 'row', gap: 12 },
  thumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#f3f4f6' },
  thumbPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, gap: 4 },
  title: { fontSize: 15, fontWeight: '600', color: '#111827' },
  price: { fontSize: 15, fontWeight: '800', color: '#1a73e8' },
  seller: { fontSize: 12, color: '#6b7280' },
  reviewBtn: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10, alignItems: 'flex-end' },
  reviewText: { color: '#7c3aed', fontWeight: '600', fontSize: 13 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});
