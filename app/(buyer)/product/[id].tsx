import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatusBadge from '../../../components/StatusBadge';
import VerifiedBadge from '../../../components/VerifiedBadge';
import { supabase } from '../../../lib/supabase';
import { Product } from '../../../lib/types';

const SCREEN_W = Dimensions.get('window').width;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*, seller:seller_profiles(*), category:categories(*)')
        .eq('id', id)
        .single();
      setProduct(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <ActivityIndicator size="large" color="#1a73e8" style={{ flex: 1, marginTop: 80 }} />;
  if (!product) return <Text style={{ textAlign: 'center', marginTop: 80, color: '#6b7280' }}>Product not found.</Text>;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <FlatList
          horizontal
          pagingEnabled
          data={product.images.length > 0 ? product.images : ['placeholder']}
          keyExtractor={(item, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => setActiveImg(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))}
          renderItem={({ item }) =>
            item === 'placeholder' ? (
              <View style={styles.imagePlaceholder}><Text style={{ fontSize: 64 }}>📦</Text></View>
            ) : (
              <Image source={{ uri: item }} style={styles.image} />
            )
          }
        />
        {/* Dots */}
        {product.images.length > 1 && (
          <View style={styles.dots}>
            {product.images.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />
            ))}
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.price}>${Number(product.price).toFixed(2)}</Text>
            <VerifiedBadge label="Verified" size="sm" />
          </View>
          <Text style={styles.title}>{product.title}</Text>
          {product.category && (
            <Text style={styles.category}>📂 {product.category.name}</Text>
          )}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Seller Info */}
          {product.seller && (
            <View style={styles.sellerBox}>
              <Text style={styles.sectionTitle}>About the Seller</Text>
              <View style={styles.sellerRow}>
                <View style={styles.sellerAvatar}>
                  <Text style={styles.sellerAvatarText}>
                    {(product.seller.full_name || 'S')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>
                    {product.seller.business_name || product.seller.full_name}
                  </Text>
                  <StatusBadge status={product.seller.status} />
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  image: { width: SCREEN_W, height: 300, backgroundColor: '#e5e7eb' },
  imagePlaceholder: { width: SCREEN_W, height: 300, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d1d5db' },
  dotActive: { backgroundColor: '#1a73e8' },
  content: { padding: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  price: { fontSize: 28, fontWeight: '800', color: '#1a73e8' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  category: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 16 },
  description: { fontSize: 15, color: '#4b5563', lineHeight: 24 },
  sellerBox: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sellerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1a73e8', justifyContent: 'center', alignItems: 'center' },
  sellerAvatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  sellerInfo: { flex: 1, gap: 6 },
  sellerName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  backBtn: { position: 'absolute', top: 12, left: 16, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  backText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
