import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
 
// NOTE: No subscription API endpoints were found in the current backend/services yet
// (per the dev plan, subscriptions are a later-phase feature). This screen is a
// working placeholder UI so the tab is functional now — wire it up to real data
// once /api/subscriptions endpoints exist.
export default function SubscriptionsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Subscriptions</Text>
 
      <View style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>🔄</Text>
        <Text style={styles.emptyTitle}>No active subscriptions</Text>
        <Text style={styles.emptyText}>
          Set up a daily, weekly, or monthly delivery plan for your favorite dairy products.
        </Text>
        <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/products')}>
          <Text style={styles.browseButtonText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  content: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  emptyText: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 20 },
  browseButton: {
    backgroundColor: 'rgba(57,211,83,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(57,211,83,0.4)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  browseButtonText: { color: '#39d353', fontWeight: 'bold', fontSize: 14 },
});
