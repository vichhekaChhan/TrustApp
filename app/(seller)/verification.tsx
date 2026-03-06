import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { sellers } from '../../lib/client';
import { SellerProfile } from '../../lib/types';

export default function VerificationScreen() {
  const { profile } = useAuth();
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState<{ uri: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      const data = await sellers.getByUserId(profile.id);
      setSellerProfile(data);
      if (data) {
        setBusinessName(data.business_name ?? '');
        setPhone(data.phone ?? '');
      }
      setFetching(false);
    })();
  }, [profile]);

  const pickIdCard = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.9,
    });
    if (!result.canceled) setIdCard({ uri: result.assets[0].uri });
  };

  const uploadIdCard = async (): Promise<string | null> => {
    if (!idCard || !profile) return sellerProfile?.id_card_url ?? null;
    return sellers.uploadIdCard(profile.id, idCard.uri).catch(() => null);
  };

  const handleSubmit = async () => {
    if (!idCard && !sellerProfile?.id_card_url) {
      Alert.alert('ID Card Required', 'Please upload a photo of your official ID card.');
      return;
    }
    setLoading(true);
    const idCardUrl = await uploadIdCard();
    if (!idCardUrl) {
      setLoading(false);
      Alert.alert('Upload Failed', 'Could not upload ID card image.');
      return;
    }
    const payload = {
      user_id: profile!.id,
      full_name: profile!.full_name,
      business_name: businessName.trim() || undefined,
      phone: phone.trim() || undefined,
      id_card_url: idCardUrl,
    };
    await sellers.submitVerification(payload);
    setLoading(false);
    Alert.alert('Submitted! 🎉', 'Your verification request has been submitted. An admin will review it shortly.');
    const data = await sellers.getByUserId(profile!.id);
    setSellerProfile(data);
  };

  if (fetching) return null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerIcon}>🪪</Text>
            <Text style={styles.headerTitle}>Seller Verification</Text>
            <Text style={styles.headerDesc}>
              Submit your ID to become a verified seller and start listing products.
            </Text>
          </View>

          {/* Steps */}
          <View style={styles.steps}>
            {['Submit ID card', 'Admin review (1-2 days)', 'Start selling!'].map((s, i) => (
              <View key={i} style={styles.step}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
                <Text style={styles.stepText}>{s}</Text>
              </View>
            ))}
          </View>

          {/* Current status */}
          {sellerProfile && (
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>Current Status</Text>
              <StatusBadge status={sellerProfile.status} />
              {sellerProfile.admin_notes && (
                <Text style={styles.adminNote}>📝 Admin notes: {sellerProfile.admin_notes}</Text>
              )}
            </View>
          )}

          {sellerProfile?.status !== 'approved' && (
            <>
              <Text style={styles.label}>Business Name (optional)</Text>
              <TextInput style={styles.input} value={businessName} onChangeText={setBusinessName} placeholder="Your store or business name" placeholderTextColor="#9ca3af" />

              <Text style={styles.label}>Phone Number (optional)</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+1 555 000 0000" keyboardType="phone-pad" placeholderTextColor="#9ca3af" />

              <Text style={styles.label}>Official ID Card Photo *</Text>
              <Text style={styles.labelSub}>National ID, Passport, or Driver's License</Text>
              <TouchableOpacity style={styles.uploadBtn} onPress={pickIdCard}>
                <Text style={styles.uploadText}>📷 {idCard ? 'Change ID photo' : 'Upload ID Card'}</Text>
              </TouchableOpacity>
              {(idCard || sellerProfile?.id_card_url) && (
                <Image
                  source={{ uri: idCard?.uri ?? sellerProfile?.id_card_url }}
                  style={styles.idPreview}
                  resizeMode="cover"
                />
              )}

              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitText}>{loading ? 'Submitting…' : 'Submit Verification'}</Text>
              </TouchableOpacity>
            </>
          )}

          {sellerProfile?.status === 'approved' && (
            <View style={styles.approvedBox}>
              <Text style={styles.approvedIcon}>🎉</Text>
              <Text style={styles.approvedTitle}>You are a Verified Seller!</Text>
              <Text style={styles.approvedText}>You can now add products to the marketplace.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  flex: { flex: 1 },
  scroll: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  headerIcon: { fontSize: 52, marginBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  headerDesc: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  steps: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1a73e8', justifyContent: 'center', alignItems: 'center' },
  stepNumText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  stepText: { color: '#374151', fontSize: 14, fontWeight: '500' },
  statusCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  statusTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10 },
  adminNote: { fontSize: 13, color: '#92400e', marginTop: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4, marginTop: 8 },
  labelSub: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 14, fontSize: 15, color: '#111827', marginBottom: 16 },
  uploadBtn: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#1a73e8', borderStyle: 'dashed', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 12 },
  uploadText: { color: '#1a73e8', fontWeight: '600', fontSize: 15 },
  idPreview: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  submitBtn: { backgroundColor: '#1a73e8', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  approvedBox: { alignItems: 'center', padding: 24, backgroundColor: '#dcfce7', borderRadius: 16 },
  approvedIcon: { fontSize: 52, marginBottom: 12 },
  approvedTitle: { fontSize: 20, fontWeight: '700', color: '#15803d', marginBottom: 8 },
  approvedText: { color: '#166534', textAlign: 'center', fontSize: 14 },
});
