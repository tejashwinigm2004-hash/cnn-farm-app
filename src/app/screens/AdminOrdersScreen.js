import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import api from '../services/api';
 
const STATUS_OPTIONS = ['pending', 'confirmed', 'delivered', 'cancelled'];
 
const getStatusColor = (status) => {
  switch (status) {
    case 'delivered': return '#39d353';
    case 'confirmed': return '#4da6ff';
    case 'pending': return '#f9c74f';
    case 'cancelled': return '#ff4444';
    default: return '#fff';
  }
};
 
export default function AdminOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
 
  useEffect(() => {
    fetchOrders();
  }, []);
 
  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/admin/orders');
      setOrders(res.data);
    } catch (err) {
      console.log('ADMIN ORDERS ERROR:', err.message);
      console.log('ADMIN ORDERS ERROR RESPONSE:', err.response?.data);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
 
  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };
 
  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/api/admin/orders/${orderId}`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.log('UPDATE STATUS ERROR:', err.message);
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };
 
  const cycleStatus = (item) => {
    const currentIndex = STATUS_OPTIONS.indexOf(item.status);
    const buttons = STATUS_OPTIONS.map((s) => ({
      text: s.charAt(0).toUpperCase() + s.slice(1),
      onPress: () => updateStatus(item._id, s),
    }));
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Update Status', `Order #${item._id.slice(-6).toUpperCase()}`, buttons);
  };
 
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#39d353" />
      </View>
    );
  }
 
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage Orders 📦</Text>
      </View>
 
      {!orders.length ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No orders yet.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#39d353" />
          }
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>
                  Order #{item._id.slice(-6).toUpperCase()}
                </Text>
                <TouchableOpacity
                  onPress={() => cycleStatus(item)}
                  disabled={updatingId === item._id}
                  style={[styles.statusPill, { borderColor: getStatusColor(item.status) }]}>
                  {updatingId === item._id ? (
                    <ActivityIndicator size="small" color={getStatusColor(item.status)} />
                  ) : (
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                      {item.status?.toUpperCase()}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
 
              <Text style={styles.customerText}>
                {item.userId?.name || 'Unknown'} · {item.userId?.phone || item.userId?.email || ''}
              </Text>
 
              {item.items?.map((product, index) => (
                <Text key={index} style={styles.itemText}>
                  • {product.name} x{product.quantity} — ₹{product.price * product.quantity}
                </Text>
              ))}
 
              <View style={styles.orderFooter}>
                <Text style={styles.totalText}>Total: ₹{item.totalAmount}</Text>
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e', paddingTop: 50 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
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
  emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
  orderCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderId: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  statusPill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: { fontWeight: 'bold', fontSize: 11 },
  customerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginBottom: 10,
  },
  itemText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 4 },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  totalText: { color: '#39d353', fontWeight: 'bold', fontSize: 15 },
  dateText: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
});
