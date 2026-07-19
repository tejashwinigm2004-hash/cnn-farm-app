// order-review.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const API_BASE_URL = 'https://cnn-project-97t2.onrender.com';

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
}

interface CartItem {
  _id?: string;
  productId: Product | string;
  quantity: number;
  name?: string;
  price?: number;
}

interface DeliveryDetails {
  name: string;
  phone: string;
  altPhone?: string;
  houseNo: string;
  street?: string;
  landmark?: string;
  city: string;
  pincode: string;
  deliveryInstructions?: string;
  deliverySlot: string;
}

export default function OrderReviewScreen() {
  const router = useRouter();
  const { cartItems, totalAmount, deliveryDetails } = useLocalSearchParams<{
    cartItems: string;
    totalAmount: string;
    deliveryDetails: string;
  }>();

  const parsedCartItems: CartItem[] = JSON.parse(cartItems);
  const parsedTotal = parseFloat(totalAmount);
  const parsedDelivery: DeliveryDetails = JSON.parse(deliveryDetails);

  const [placingOrder, setPlacingOrder] = useState(false);

  const getProduct = (item: CartItem): Product | CartItem =>
    typeof item.productId === 'object' && item.productId !== null
      ? item.productId
      : item;

  const getProductId = (item: CartItem): string => {
    if (typeof item.productId === 'object' && item.productId !== null) {
      return item.productId._id;
    }
    return (item.productId as string) || item._id || '';
  };

  const handleConfirmOrder = async () => {
    try {
      setPlacingOrder(true);
      const token = await AsyncStorage.getItem('userToken');

      const orderPayload = {
        items: parsedCartItems.map(item => {
          const product = getProduct(item) as Product;
          return {
            productId: getProductId(item), // confirm this matches your Order schema field name
            quantity: item.quantity,
            price: product.price,
          };
        }),
        totalAmount: parsedTotal,
        deliveryAddress: {
          name: parsedDelivery.name,
          phone: parsedDelivery.phone,
          altPhone: parsedDelivery.altPhone,
          houseNo: parsedDelivery.houseNo,
          street: parsedDelivery.street,
          landmark: parsedDelivery.landmark,
          city: parsedDelivery.city,
          pincode: parsedDelivery.pincode,
        },
        deliveryInstructions: parsedDelivery.deliveryInstructions,
        deliverySlot: parsedDelivery.deliverySlot,
        paymentStatus: 'pending',
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/orders/create`,
        orderPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      router.replace({
        pathname: '/order-confirmation',
        params: { orderId: response.data._id },
      });
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Order Failed', 'Something went wrong. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Review Your Order</Text>

        <Text style={styles.sectionTitle}>Items</Text>
        {parsedCartItems.map((item, index) => {
          const product = getProduct(item) as Product;
          return (
            <View key={getProductId(item) || index} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {product.name} x{item.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                ₹{(product.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          );
        })}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Deliver To</Text>
        <Text style={styles.detailText}>
          {parsedDelivery.name} · {parsedDelivery.phone}
        </Text>
        <Text style={styles.detailText}>
          {parsedDelivery.houseNo}, {parsedDelivery.street}
        </Text>
        {parsedDelivery.landmark ? (
          <Text style={styles.detailText}>Landmark: {parsedDelivery.landmark}</Text>
        ) : null}
        <Text style={styles.detailText}>
          {parsedDelivery.city} - {parsedDelivery.pincode}
        </Text>
        <Text style={styles.detailText}>Slot: {parsedDelivery.deliverySlot}</Text>
        {parsedDelivery.deliveryInstructions ? (
          <Text style={styles.detailText}>Note: {parsedDelivery.deliveryInstructions}</Text>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>₹{parsedTotal.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, placingOrder && { opacity: 0.6 }]}
          onPress={handleConfirmOrder}
          disabled={placingOrder}
        >
          {placingOrder ? (
            <ActivityIndicator color="#0F0F0F" />
          ) : (
            <Text style={styles.confirmBtnText}>Confirm Order</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F0F0F' },
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: '600', color: '#fff', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#E8A33D', marginBottom: 8, marginTop: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  itemName: { color: '#fff', fontSize: 14 },
  itemPrice: { color: '#39d353', fontSize: 14, fontWeight: '600' },
  detailText: { color: '#ccc', fontSize: 14, marginBottom: 4 },
  divider: { height: 1, backgroundColor: '#2A2A2A', marginVertical: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  totalLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  totalAmount: { color: '#E8A33D', fontSize: 18, fontWeight: '700' },
  confirmBtn: { backgroundColor: '#39d353', padding: 14, borderRadius: 8, marginBottom: 30, alignItems: 'center' },
  confirmBtnText: { color: '#0F0F0F', fontWeight: '700', fontSize: 16 },
});