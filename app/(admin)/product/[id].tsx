import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatusBadge from '../../../components/StatusBadge';
import { supabase } from '../../../lib/supabase';
import { Product, VerificationStatus } from '../../../lib/types';

const SCREEN_W = Dimensions.get('window').width - 40;

export default function AdminProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*, seller:seller_profiles(*), category:categories(*)')
        .eq('id', id)
        .single();
      setProduct(data);
      setAdminNotes(data?.admin_notes ?? '');
      setLoading(false);
    })();
  }, [id]);

  const updateStatus = async (status: VerificationStatus) => {
    if (!product) return;
    setSaving(true);
    const { error } = await supabase.from('products').update({
      status,
      admin_notes: adminNotes.trim() || null,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id);
    setSaving(false);
    if (error) { Alert.alert('Error', error.message); return; }
    setProduct((prev) => prev ? { ...prev, status } : prev);
    Alert.alert('Updated!', `Product has been ${status}.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const confirmAction = (status: VerificationStatus) => {
    const messages: Record<VerificationStatus, string> = {
      approved: 'Approve this product? It will be visible to buyers.',
      rejected: 'Reject this product? The seller will be notified.',
      pending: 'Reset to pending.',
    };
    Alert.alert(`${status.charAt(0).toUpperCase() + status.slice(1)} Product`, messages[status], [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => updateStatus(status) },
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="#7c3aed" style={{ flex: 1, marginTop: 80 }} />;
  if (!product) return <Text style={{ textAlign: 'center', marginTop: 80, color: '#6b7280' }}>Product not found.</Text>;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Images */}
        {product.images.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📸 Product Images</Text>
            <FlatList
              horizontal
              data={product.images}
              keyExtractor={(_, i) => `${i}`}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.productImage} />
              )}
            />
          </View>
        )}

        {/* Product Info */}
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.productTitle}>{product.title}</Text>
            <StatusBadge status={product.status} />
          </View>
          <Text style={styles.price}>${Number(product.price).toFixed(2)}</Text>
          {product.category && <Text style={styles.category}>📂 {product.category.name}</Text>}
          <Text style={styles.descLabel}>Description</Text>
          <Text style={styles.desc}>{product.description}</Text>
          <Text style={styles.date}>Submitted: {new Date(product.created_at).toLocaleDateString()}</Text>
        </View>

        {/* Seller Info */}
        {product.seller && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>👤 Seller</Text>
            <Text style={styles.sellerName}>{product.seller.full_name}</Text>
            {product.seller.business_name && <Text style={styles.sellerBiz}>🏪 {product.seller.business_name}</Text>}
            <StatusBadge status={product.seller.status} />
          </View>
        )}

        {/* Admin Notes */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📝 Admin Notes</Text>
          <TextInput
            style={styles.notes}
            value={adminNotes}
            onChangeText={setAdminNotes}
            placeholder="Notes to send to the seller (optional)…"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btnApprove, saving && styles.btnDisabled]}
            onPress={() => confirmAction('approved')}
            disabled={saving || product.status === 'approved'}
          >
            <Text style={styles.btnApproveText}>✅ Approve Product</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnReject, saving && styles.btnDisabled]}
            onPress={() => confirmAction('rejected')}
            disabled={saving || product.status === 'rejected'}
          >
            <Text style={styles.btnRejectText}>❌ Reject Product</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back to list</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 12 },
  productImage: { width: SCREEN_W * 0.6, height: 180, borderRadius: 10, marginRight: 10 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  productTitle: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  price: { fontSize: 22, fontWeight: '800', color: '#1a73e8', marginBottom: 6 },
  category: { fontSize: 13, color: '#6b7280', marginBottom: 10 },
  descLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  desc: { fontSize: 14, color: '#4b5563', lineHeight: 22, marginBottom: 10 },
  date: { fontSize: 12, color: '#9ca3af' },
  sellerName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  sellerBiz: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  notes: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827', minHeight: 80, textAlignVertical: 'top' },
  actions: { gap: 12, marginBottom: 16 },
  btnApprove: { backgroundColor: '#dcfce7', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnApproveText: { color: '#15803d', fontWeight: '700', fontSize: 16 },
  btnReject: { backgroundColor: '#fee2e2', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnRejectText: { color: '#b91c1c', fontWeight: '700', fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
  backBtn: { alignItems: 'center', padding: 12 },
  backText: { color: '#7c3aed', fontWeight: '600' },
});
