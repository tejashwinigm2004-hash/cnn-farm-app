import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
 
export default function OrdersScreen() {
  const { colors } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    fetchOrders();
  }, []);
 
  const fetchOrders = async () => {
    try {
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      const res = await api.get(`/api/orders/${user.id}`);
      setOrders(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };
 
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#39d353';
      case 'processing': return '#f9c74f';
      case 'cancelled': return '#ff4444';
      default: return colors.text;
    }
  };
 
  const s = getStyles(colors);
 
  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color="#39d353" />
      </View>
    );
  }
 
  return (
    <View style={s.container}>
      <Text style={s.title}>My Orders 📦</Text>
 
      {!orders.length ? (
        <View style={s.centered}>
          <Text style={s.emptyText}>No orders yet!</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={s.orderCard}>
              <View style={s.orderHeader}>
                <Text style={s.orderId}>
                  Order #{item._id.slice(-6).toUpperCase()}
                </Text>
                <Text style={[s.status, { color: getStatusColor(item.status) }]}>
                  {item.status?.toUpperCase()}
                </Text>
              </View>
 
              {item.items?.map((product, index) => (
                <Text key={index} style={s.itemText}>
                  • {product.name} x{product.quantity} — ₹{product.price * product.quantity}
                </Text>
              ))}
 
              <View style={s.orderFooter}>
                <Text style={s.totalText}>Total: ₹{item.totalAmount}</Text>
                <Text style={s.dateText}>
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
 
function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
      paddingTop: 50,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 16,
    },
    orderCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    orderId: {
      color: colors.text,
      fontWeight: 'bold',
      fontSize: 15,
    },
    status: {
      fontWeight: 'bold',
      fontSize: 13,
    },
    itemText: {
      color: colors.textMuted,
      fontSize: 13,
      marginBottom: 4,
    },
    orderFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    totalText: {
      color: '#39d353',
      fontWeight: 'bold',
      fontSize: 15,
    },
    dateText: {
      color: colors.textFaint,
      fontSize: 13,
    },
  });
}