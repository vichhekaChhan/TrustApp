import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Product } from '../lib/types';
import VerifiedBadge from './VerifiedBadge';

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const image = product.images?.[0];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/(buyer)/product/[id]', params: { id: product.id } })}
      activeOpacity={0.85}
    >
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>📦</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <Text style={styles.price}>${Number(product.price).toFixed(2)}</Text>
        {product.status === 'approved' && (
          <VerifiedBadge label="Verified Product" size="sm" />
        )}
        {product.seller && (
          <Text style={styles.seller} numberOfLines={1}>
            by {product.seller.business_name || product.seller.full_name}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  image: { width: '100%', height: 180, backgroundColor: '#f3f4f6' },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 48 },
  body: { padding: 14 },
  title: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 6 },
  price: { fontSize: 18, fontWeight: '800', color: '#1a73e8', marginBottom: 8 },
  seller: { fontSize: 12, color: '#6b7280', marginTop: 6 },
});
