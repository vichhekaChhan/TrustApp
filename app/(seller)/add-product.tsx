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
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Category, SellerProfile } from '../../lib/types';

export default function AddProductScreen() {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      const [{ data: sp }, { data: cats }] = await Promise.all([
        supabase.from('seller_profiles').select('*').eq('user_id', profile.id).single(),
        supabase.from('categories').select('*').order('name'),
      ]);
      setSellerProfile(sp);
      setCategories(cats ?? []);
    })();
  }, [profile]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) setImages(result.assets.map((a) => ({ uri: a.uri })));
  };

  const uploadImages = async (sellerId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const img of images) {
      const filename = `products/${sellerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const response = await fetch(img.uri);
      const blob = await response.blob();
      const { error } = await supabase.storage.from('product-images').upload(filename, blob, { contentType: 'image/jpeg' });
      if (!error) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(filename);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!title || !description || !price) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    if (!sellerProfile) {
      Alert.alert('Not Verified', 'You must submit verification documents first.');
      return;
    }
    if (sellerProfile.status !== 'approved') {
      Alert.alert('Pending Approval', 'Your seller account must be approved before adding products.');
      return;
    }
    setLoading(true);
    const imageUrls = await uploadImages(sellerProfile.id);
    const { error } = await supabase.from('products').insert({
      seller_id: sellerProfile.id,
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category_id: categoryId,
      images: imageUrls,
      status: 'pending',
    });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    Alert.alert('Product Submitted! 🎉', 'Your product is pending admin review and will appear once approved.');
    setTitle('');
    setDescription('');
    setPrice('');
    setCategoryId(null);
    setImages([]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>📋 Your product will be reviewed by an admin before it appears in the marketplace</Text>
          </View>

          <Text style={styles.label}>Product Title *</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Handmade Leather Wallet" placeholderTextColor="#9ca3af" />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your product in detail…"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Price (USD) *</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            keyboardType="decimal-pad"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.catGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, categoryId === cat.id && styles.catChipActive]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text style={[styles.catText, categoryId === cat.id && styles.catTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Product Images</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickImages}>
            <Text style={styles.uploadText}>📸 Select Images ({images.length} selected)</Text>
          </TouchableOpacity>
          {images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow}>
              {images.map((img, i) => (
                <Image key={i} source={{ uri: img.uri }} style={styles.preview} />
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.submitText}>{loading ? 'Submitting…' : 'Submit for Review'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  flex: { flex: 1 },
  scroll: { padding: 20 },
  infoBanner: { backgroundColor: '#fef3c7', borderRadius: 12, padding: 12, marginBottom: 20 },
  infoText: { color: '#92400e', fontSize: 13, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 14, fontSize: 15, color: '#111827', marginBottom: 16 },
  textarea: { height: 100, textAlignVertical: 'top' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catChip: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff' },
  catChipActive: { backgroundColor: '#1a73e8', borderColor: '#1a73e8' },
  catText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  catTextActive: { color: '#fff', fontWeight: '600' },
  uploadBtn: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#1a73e8', borderStyle: 'dashed', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 12 },
  uploadText: { color: '#1a73e8', fontWeight: '600', fontSize: 15 },
  previewRow: { marginBottom: 16 },
  preview: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },
  submitBtn: { backgroundColor: '#1a73e8', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
