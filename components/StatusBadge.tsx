import { StyleSheet, Text, View } from 'react-native';
import { VerificationStatus } from '../lib/types';

const config: Record<VerificationStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending:  { label: 'Pending Review', color: '#92400e', bg: '#fef3c7', icon: '⏳' },
  approved: { label: 'Approved',       color: '#15803d', bg: '#dcfce7', icon: '✅' },
  rejected: { label: 'Rejected',       color: '#b91c1c', bg: '#fee2e2', icon: '❌' },
};

export default function StatusBadge({ status }: { status: VerificationStatus }) {
  const c = config[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={styles.icon}>{c.icon}</Text>
      <Text style={[styles.text, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  icon: { fontSize: 11 },
  text: { fontWeight: '600', fontSize: 12 },
});
