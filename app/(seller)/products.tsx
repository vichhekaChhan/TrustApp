import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { sellers, products as productsApi } from '../../lib/client';
import { Product } from '../../lib/types';

export default function SellerProductsScreen() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerId, setSellerId] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!profile) return;
    setLoading(true);
    const sp = await sellers.getByUserId(profile.id);
    if (!sp) { setLoading(false); return; }
    setSellerId(sp.id);
    const data = await productsApi.getBySeller(sp.id);
    setProducts(data);
    setLoading(false);
  };

  const deleteProduct = (id: string) => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await productsApi.delete(id);
          setProducts((prev) => prev.filter((p) => p.id !== id));
        },
      },
    ]);
  };

  useEffect(() => { fetchProducts(); }, [profile]);

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
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
          <StatusBadge status={item.status} />
          {item.admin_notes && (
            <Text style={styles.adminNote}>📝 {item.admin_notes}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.delBtn} onPress={() => deleteProduct(item.id)}>
        <Text style={styles.delText}>🗑 Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#1a73e8" style={{ flex: 1, marginTop: 80 }} />;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {products.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No products yet</Text>
          <Text style={styles.emptySub}>Add your first product from the Add tab</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  row: { flexDirection: 'row', gap: 12 },
  thumb: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#f3f4f6' },
  thumbPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, gap: 4 },
  title: { fontSize: 15, fontWeight: '600', color: '#111827' },
  price: { fontSize: 16, fontWeight: '800', color: '#1a73e8' },
  adminNote: { fontSize: 12, color: '#92400e', marginTop: 2 },
  delBtn: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10, alignItems: 'flex-end' },
  delText: { color: '#dc2626', fontWeight: '600', fontSize: 13 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 4 },
  emptySub: { color: '#6b7280', textAlign: 'center' },
});
