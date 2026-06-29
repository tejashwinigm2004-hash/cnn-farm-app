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
 
const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled'];
 
const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed': return '#39d353';
    case 'pending': return '#f9c74f';
    case 'cancelled': return '#ff4444';
    default: return '#fff';
  }
};
 
export default function AdminBookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
 
  useEffect(() => {
    fetchBookings();
  }, []);
 
  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/admin/bookings');
      setBookings(res.data);
    } catch (err) {
      console.log('ADMIN BOOKINGS ERROR:', err.message);
      console.log('ADMIN BOOKINGS ERROR RESPONSE:', err.response?.data);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
 
  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };
 
  const updateStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await api.patch(`/api/admin/bookings/${bookingId}`, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.log('UPDATE BOOKING STATUS ERROR:', err.message);
      Alert.alert('Error', 'Failed to update booking status');
    } finally {
      setUpdatingId(null);
    }
  };
 
  const cycleStatus = (item) => {
    const buttons = STATUS_OPTIONS.map((s) => ({
      text: s.charAt(0).toUpperCase() + s.slice(1),
      onPress: () => updateStatus(item._id, s),
    }));
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Update Status', `Booking for ${item.name}`, buttons);
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
        <Text style={styles.title}>Manage Bookings 📅</Text>
      </View>
 
      {!bookings.length ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No bookings yet.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#39d353" />
          }
          renderItem={({ item }) => (
            <View style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.customerName}>{item.name}</Text>
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
 
              <Text style={styles.detailText}>📞 {item.phone}</Text>
              <Text style={styles.detailText}>✉️ {item.email}</Text>
 
              <View style={styles.bookingFooter}>
                <Text style={styles.dateText}>📅 {item.date}</Text>
                <Text style={styles.slotText}>{item.timeSlot}</Text>
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
  bookingCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  customerName: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  statusPill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: { fontWeight: 'bold', fontSize: 11 },
  detailText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 4 },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 10,
  },
  dateText: { color: '#39d353', fontWeight: 'bold', fontSize: 13 },
  slotText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
});