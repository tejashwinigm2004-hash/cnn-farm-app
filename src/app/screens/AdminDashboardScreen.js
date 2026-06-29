import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import api from '../services/api';
 
export default function AdminDashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
 
  useEffect(() => {
    fetchAnalytics();
  }, []);
 
  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/api/admin/analytics');
      setStats(res.data);
    } catch (err) {
      console.log('ANALYTICS ERROR:', err.message);
      console.log('ANALYTICS ERROR RESPONSE:', err.response?.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
 
  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };
 
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#39d353" />
      }>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Admin Dashboard 🛡️</Text>
      </View>
 
      {loading ? (
        <ActivityIndicator color="#39d353" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.totalOrders ?? 0}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹{stats?.totalRevenue ?? 0}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.totalProducts ?? 0}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.totalBookings ?? 0}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
        </View>
      )}
 
      <Text style={styles.sectionHeading}>Manage</Text>
      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/admin-orders')}>
          <Text style={styles.menuIcon}>📦</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Orders</Text>
            <Text style={styles.menuSubtext}>View and update order status</Text>
          </View>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
 
        <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/admin-products')}>
          <Text style={styles.menuIcon}>🛒</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Products</Text>
            <Text style={styles.menuSubtext}>Add, edit, or remove products</Text>
          </View>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
 
        <TouchableOpacity style={styles.menuCard} onPress={() => router.push('/admin-bookings')}>
          <Text style={styles.menuIcon}>📅</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Bookings</Text>
            <Text style={styles.menuSubtext}>Manage discovery call bookings</Text>
          </View>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>
 
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  contentContainer: { paddingBottom: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backArrow: { color: '#fff', fontSize: 18 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  statCard: {
    width: '46%',
    margin: '2%',
    backgroundColor: 'rgba(57,211,83,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(57,211,83,0.3)',
    padding: 18,
    alignItems: 'center',
  },
  statValue: { color: '#39d353', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#39d353',
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 16,
  },
  menuList: { marginHorizontal: 20 },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  menuIcon: { fontSize: 24, marginRight: 14 },
  menuTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  menuSubtext: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  menuArrow: { color: '#39d353', fontSize: 18, fontWeight: 'bold' },
});