import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../components/ProductCard';
import { supabase } from '../../lib/supabase';
import { Category, Product } from '../../lib/types';

export default function BuyerHomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data ?? []);
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*, seller:seller_profiles(*), category:categories(*)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (selectedCategory) query = query.eq('category_id', selectedCategory);
    if (search.trim()) query = query.ilike('title', `%${search.trim()}%`);

    const { data } = await query;
    setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchProducts(); }, [selectedCategory, search]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search verified products…"
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Trust Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>🛡️ All products are admin-verified before listing</Text>
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={[{ id: null as any, name: 'All' }, ...categories]}
        keyExtractor={(item) => item.id ?? 'all'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, selectedCategory === item.id && styles.catChipActive]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text style={[styles.catText, selectedCategory === item.id && styles.catTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Products */}
      {loading ? (
        <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 48 }} />
      ) : products.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No verified products found</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  search: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  banner: {
    backgroundColor: '#dcfce7',
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  bannerText: { color: '#15803d', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  catList: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  catChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  catChipActive: { backgroundColor: '#1a73e8', borderColor: '#1a73e8' },
  catText: { color: '#374151', fontWeight: '600', fontSize: 13 },
  catTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});
