import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.checkmark}>✓</Text>
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>
          Your order has been confirmed and is being prepared.
        </Text>

        {orderId ? (
          <View style={styles.orderIdBox}>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text style={styles.orderIdValue}>{orderId}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => router.push('/(tabs)/orders')}
        >
          <Text style={styles.trackBtnText}>Track Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  checkmark: {
    fontSize: 56,
    color: '#39d353',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 24,
  },
  orderIdBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  orderIdLabel: { color: '#888', fontSize: 12, marginBottom: 4 },
  orderIdValue: { color: '#E8A33D', fontSize: 16, fontWeight: '700' },
  trackBtn: {
    backgroundColor: '#E8A33D',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackBtnText: { color: '#0F0F0F', fontWeight: '700', fontSize: 16 },
  homeBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  homeBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});