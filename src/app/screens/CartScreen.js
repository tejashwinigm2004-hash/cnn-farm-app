// CartScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProductImage } from '../utils/productImages';

const API_BASE_URL = 'https://cnn-project-97t2.onrender.com';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');

      const response = await axios.get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      Alert.alert('Error', 'Could not load your cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [])
  );

  const getProduct = (item) => item.productId || item;
  const getProductId = (item) =>
    item.productId?._id || item.productId || item._id;

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems(prev =>
      prev.map(item =>
        getProductId(item) === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('userToken');
      await axios.post(
        `${API_BASE_URL}/api/cart/add`,
        {
          productId,
          quantity:
            newQuantity -
            (cartItems.find(i => getProductId(i) === productId)?.quantity || 0),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Could not update quantity.');
      fetchCart();
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (productId) => {
    Alert.alert('Remove Item', 'Remove this item from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.delete(`${API_BASE_URL}/api/cart/remove/${productId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setCartItems(prev => prev.filter(item => getProductId(item) !== productId));
          } catch (error) {
            console.error('Error removing item:', error);
            Alert.alert('Error', 'Could not remove item.');
          }
        },
      },
    ]);
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    const product = getProduct(item);
    return sum + (product.price || 0) * item.quantity;
  }, 0);

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart is empty', 'Add some products before placing an order.');
      return;
    }

    router.push({
      pathname: '/delivery-details',
      params: {
        cartItems: JSON.stringify(cartItems),
        totalAmount: totalAmount.toString(),
      },
    });
  };

  const handleBrowseProducts = () => {
    router.push('/products');
  };

  const renderItem = ({ item }) => {
    const product = getProduct(item);
    const productId = getProductId(item);

    return (
      <View style={styles.itemCard}>
        <Image source={getProductImage(product.name)} style={styles.itemImage} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{product.name}</Text>
          <Text style={styles.itemPrice}>₹{product.price} x {item.quantity}</Text>

          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQuantity(productId, item.quantity - 1)}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qtyText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQuantity(productId, item.quantity + 1)}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.itemRightCol}>
          <Text style={styles.itemSubtotal}>₹{(product.price * item.quantity).toFixed(2)}</Text>
          <TouchableOpacity onPress={() => removeItem(productId)}>
            <Text style={styles.removeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#E8A33D" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Cart 🛍️</Text>

      {cartItems.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={handleBrowseProducts}>
            <Text style={styles.shopBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item, index) => item._id || index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          <View style={[styles.footer, { paddingBottom: insets.bottom + 70 }]}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total: ₹{totalAmount.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.placeOrderBtn, updating && { opacity: 0.6 }]}
              onPress={handlePlaceOrder}
              disabled={updating}
            >
              <Text style={styles.placeOrderText}>Pay & Place Order →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  header: { fontSize: 28, fontWeight: '700', color: '#111111', marginBottom: 16 },
  emptyText: { color: '#111111', fontSize: 16, marginBottom: 16 },
  shopBtn: { backgroundColor: '#39d353', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  shopBtnText: { color: '#FFFFFF', fontWeight: '600' },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  itemImage: { width: 56, height: 56, borderRadius: 8, marginRight: 12 },
  itemDetails: { flex: 1 },
  itemName: { color: '#111111', fontSize: 17, fontWeight: '700' },
  itemPrice: { color: '#555555', fontSize: 14, marginTop: 4 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { color: '#111111', fontSize: 15, fontWeight: '700' },
  qtyText: { color: '#111111', marginHorizontal: 10, fontSize: 14 },
  itemRightCol: { alignItems: 'flex-end', justifyContent: 'space-between', height: 56 },
  itemSubtotal: { color: '#2E9E43', fontWeight: '700', fontSize: 16 },
  removeIcon: { color: '#E24C4C', fontSize: 18, fontWeight: '700' },
  footer: { borderTopWidth: 1, borderTopColor: '#EEEEEE', paddingTop: 16 },
  totalRow: { marginBottom: 12 },
  totalLabel: { color: '#111111', fontSize: 20, fontWeight: '700' },
  placeOrderBtn: { backgroundColor: '#39d353', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  placeOrderText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});