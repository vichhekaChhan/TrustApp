import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>Requesting camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.msg}>Camera access is required to scan product QR codes.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Expected format: product QR encodes the product ID
    // e.g. "product:1" or just a raw product id
    const productId = data.startsWith('product:') ? data.replace('product:', '') : data;

    Alert.alert(
      'Product Found',
      `Navigating to product…`,
      [
        {
          text: 'View Product',
          onPress: () => {
            setScanned(false);
            router.push(`/(buyer)/product/${productId}`);
          },
        },
        {
          text: 'Scan Again',
          onPress: () => setScanned(false),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.topOverlay} />
        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanBox}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay}>
          <Text style={styles.hint}>Point camera at a product QR code</Text>
          {scanned && (
            <TouchableOpacity style={styles.btn} onPress={() => setScanned(false)}>
              <Text style={styles.btnText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const BOX = 240;
const CORNER = 24;
const BORDER = 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { ...StyleSheet.absoluteFillObject },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#f9fafb' },
  icon: { fontSize: 56, marginBottom: 16 },
  msg: { fontSize: 15, color: '#374151', textAlign: 'center', marginBottom: 24 },
  btn: { backgroundColor: '#1a73e8', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Viewfinder overlay
  overlay: { ...StyleSheet.absoluteFillObject },
  topOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  middleRow: { flexDirection: 'row', height: BOX },
  sideOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  scanBox: { width: BOX, height: BOX },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    paddingTop: 24,
    gap: 16,
  },
  hint: { color: '#fff', fontSize: 14, fontWeight: '500' },

  // Corner brackets
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: '#1a73e8' },
  tl: { top: 0, left: 0, borderTopWidth: BORDER, borderLeftWidth: BORDER },
  tr: { top: 0, right: 0, borderTopWidth: BORDER, borderRightWidth: BORDER },
  bl: { bottom: 0, left: 0, borderBottomWidth: BORDER, borderLeftWidth: BORDER },
  br: { bottom: 0, right: 0, borderBottomWidth: BORDER, borderRightWidth: BORDER },
});
