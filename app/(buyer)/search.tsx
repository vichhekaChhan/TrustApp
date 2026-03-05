import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../components/ProductCard';
import { supabase } from '../../lib/supabase';
import { Product } from '../../lib/types';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from('products')
      .select('*, seller:seller_profiles(*), category:categories(*)')
      .eq('status', 'approved')
      .ilike('title', `%${query.trim()}%`)
      .order('created_at', { ascending: false });
    setResults(data ?? []);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search products…"
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>
      {loading && <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 40 }} />}
      {!loading && searched && results.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No results for "{query}"</Text>
        </View>
      )}
      {!loading && !searched && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>Search for verified products</Text>
        </View>
      )}
      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  searchRow: { padding: 16 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#111827',
  },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});
