import { StyleSheet, Text, View } from 'react-native';

interface VerifiedBadgeProps {
  label?: string;
  size?: 'sm' | 'md';
}

export default function VerifiedBadge({ label = 'Verified', size = 'md' }: VerifiedBadgeProps) {
  return (
    <View style={[styles.badge, size === 'sm' && styles.badgeSm]}>
      <Text style={[styles.icon, size === 'sm' && styles.iconSm]}>✅</Text>
      <Text style={[styles.text, size === 'sm' && styles.textSm]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  badgeSm: { paddingHorizontal: 6, paddingVertical: 2 },
  icon: { fontSize: 12 },
  iconSm: { fontSize: 10 },
  text: { color: '#15803d', fontWeight: '600', fontSize: 12 },
  textSm: { fontSize: 10 },
});
