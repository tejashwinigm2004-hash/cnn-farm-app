import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

export default function OrdersScreen() {
  const { colors } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

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

  const payForOrder = async (order) => {
    setPayingId(order._id);
    try {
      const orderRes = await api.post('/api/payment/create-order', {
        amount: order.totalAmount,
      });
      const razorpayOrder = orderRes.data;

      const paymentData = await RazorpayCheckout.open({
        description: 'CNN Farm Hub Order Payment',
        currency: 'INR',
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        order_id: razorpayOrder.id,
        name: 'CNN Farm Hub',
        theme: { color: '#39d353' },
      });

      const verifyRes = await api.post('/api/payment/verify-payment', {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      });

      if (!verifyRes.data.verified) {
        Alert.alert('Payment Failed', 'Payment verification failed. Please try again.');
        return;
      }

      await api.patch(`/api/orders/${order._id}/payment`, {
        paymentId: paymentData.razorpay_payment_id,
        paymentStatus: 'paid',
      });

      Alert.alert('Success', 'Payment successful! 🎉');
      fetchOrders();
    } catch (err) {
      if (err.code === 0 || err.description) {
        Alert.alert('Payment Cancelled', 'Payment was cancelled or failed.');
      } else {
        Alert.alert('Error', 'Something went wrong while processing payment.');
      }
    } finally {
      setPayingId(null);
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
                <View key={index} style={s.productRow}>
                  {product.image ? (
                    <Image source={{ uri: product.image }} style={s.productImage} />
                  ) : (
                    <View style={[s.productImage, s.productImagePlaceholder]}>
                      <Text style={s.productImagePlaceholderText}>🥛</Text>
                    </View>
                  )}
                  <Text style={s.itemText}>
                    {product.name} x{product.quantity} — ₹{product.price * product.quantity}
                  </Text>
                </View>
              ))}

              <View style={s.orderFooter}>
                <Text style={s.totalText}>Total: ₹{item.totalAmount}</Text>
                <Text style={s.dateText}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>

              {item.paymentStatus !== 'paid' ? (
                <TouchableOpacity
                  style={s.payButton}
                  onPress={() => payForOrder(item)}
                  disabled={payingId === item._id}>
                  {payingId === item._id
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={s.payButtonText}>Pay Now →</Text>
                  }
                </TouchableOpacity>
              ) : (
                <View style={s.paidBadge}>
                  <Text style={s.paidBadgeText}>✅ Paid</Text>
                </View>
              )}
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
    productRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    productImage: {
      width: 32,
      height: 32,
      borderRadius: 8,
      marginRight: 10,
    },
    productImagePlaceholder: {
      backgroundColor: colors.inputBg || 'rgba(0,0,0,0.05)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    productImagePlaceholderText: {
      fontSize: 16,
    },
    itemText: {
      color: colors.textMuted,
      fontSize: 13,
      flex: 1,
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
    payButton: {
      backgroundColor: '#39d353',
      borderRadius: 10,
      padding: 12,
      alignItems: 'center',
      marginTop: 12,
    },
    payButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    paidBadge: {
      marginTop: 12,
      alignItems: 'center',
    },
    paidBadgeText: {
      color: '#39d353',
      fontWeight: '600',
      fontSize: 13,
    },
  });
}