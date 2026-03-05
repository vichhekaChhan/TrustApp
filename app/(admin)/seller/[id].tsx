import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { SellerProfile, VerificationStatus } from '../../../lib/types';

export default function AdminSellerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('seller_profiles')
        .select('*, profile:profiles(*)')
        .eq('id', id)
        .single();
      setSeller(data);
      setAdminNotes(data?.admin_notes ?? '');
      setLoading(false);
    })();
  }, [id]);

  const updateStatus = async (status: VerificationStatus) => {
    if (!seller) return;
    setSaving(true);
    const { error } = await supabase.from('seller_profiles').update({
      status,
      admin_notes: adminNotes.trim() || null,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id);
    setSaving(false);
    if (error) { Alert.alert('Error', error.message); return; }
    setSeller((prev) => prev ? { ...prev, status, admin_notes: adminNotes.trim() || undefined } : prev);
    Alert.alert('Updated!', `Seller has been ${status}.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const confirmAction = (status: VerificationStatus) => {
    const messages: Record<VerificationStatus, string> = {
      approved: 'Approve this seller? They will be able to list products.',
      rejected: 'Reject this seller? They will be notified.',
      pending: 'Reset this seller to pending review.',
    };
    Alert.alert(`${status.charAt(0).toUpperCase() + status.slice(1)} Seller`, messages[status], [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => updateStatus(status) },
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="#7c3aed" style={{ flex: 1, marginTop: 80 }} />;
  if (!seller) return <Text style={{ textAlign: 'center', marginTop: 80, color: '#6b7280' }}>Seller not found.</Text>;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Seller Info */}
        <View style={styles.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(seller.full_name || 'S')[0].toUpperCase()}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{seller.full_name}</Text>
              {seller.business_name && <Text style={styles.biz}>🏪 {seller.business_name}</Text>}
              {seller.phone && <Text style={styles.phone}>📱 {seller.phone}</Text>}
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status:</Text>
            <StatusBadge status={seller.status} />
          </View>
          <Text style={styles.date}>Submitted: {new Date(seller.submitted_at).toLocaleDateString()}</Text>
        </View>

        {/* ID Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🪪 Submitted ID Card</Text>
          {seller.id_card_url ? (
            <Image source={{ uri: seller.id_card_url }} style={styles.idCard} resizeMode="contain" />
          ) : (
            <Text style={styles.noId}>No ID card uploaded.</Text>
          )}
        </View>

        {/* Admin Notes */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📝 Admin Notes</Text>
          <TextInput
            style={styles.notes}
            value={adminNotes}
            onChangeText={setAdminNotes}
            placeholder="Add notes for the seller (optional)…"
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
            disabled={saving || seller.status === 'approved'}
          >
            <Text style={styles.btnApproveText}>✅ Approve Seller</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnReject, saving && styles.btnDisabled]}
            onPress={() => confirmAction('rejected')}
            disabled={saving || seller.status === 'rejected'}
          >
            <Text style={styles.btnRejectText}>❌ Reject Seller</Text>
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
  avatarRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  headerInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: '#111827' },
  biz: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  phone: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  statusLabel: { fontSize: 14, color: '#374151', fontWeight: '600' },
  date: { fontSize: 12, color: '#9ca3af' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 12 },
  idCard: { width: '100%', height: 220, borderRadius: 10, backgroundColor: '#f3f4f6' },
  noId: { color: '#9ca3af', fontStyle: 'italic' },
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
