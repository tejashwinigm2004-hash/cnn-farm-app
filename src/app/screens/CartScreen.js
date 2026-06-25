import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import api from '../services/api';
 
export default function CartScreen() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
 
  useEffect(() => {
    fetchCart();
  }, []);
 
  const fetchCart = async () => {
    try {
      const res = await api.get('/api/cart/');
      setCart(res.data);
    } catch (err) {
      console.log('CART ERROR:', err.message);
      console.log('CART ERROR RESPONSE:', err.response?.data);
      console.log('CART ERROR STATUS:', err.response?.status);
      Alert.alert('Error', `Failed to load cart: ${err.response?.status || err.message}`);
    } finally {
      setLoading(false);
    }
  };
 
  const removeItem = async (productId) => {
    try {
      await api.delete(`/api/cart/remove/${productId}`);
      fetchCart();
    } catch (err) {
      console.log('REMOVE ERROR:', err.message);
      console.log('REMOVE ERROR RESPONSE:', err.response?.data);
      Alert.alert('Error', 'Failed to remove item');
    }
  };
 
  const placeOrder = async () => {
    setOrdering(true);
    try {
      const totalAmount = cart.items.reduce(
        (sum, item) => sum + item.productId.price * item.quantity, 0
      );
      await api.post('/api/orders/create', {
        items: cart.items.map(item => ({
          productId: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          quantity: item.quantity
        })),
        totalAmount,
        deliveryAddress: 'Default Address'
      });
      Alert.alert('Success', 'Order placed successfully! 🎉');
      router.push('/orders');
    } catch (err) {
      console.log('ORDER ERROR:', err.message);
      console.log('ORDER ERROR RESPONSE:', err.response?.data);
      console.log('ORDER ERROR STATUS:', err.response?.status);
      Alert.alert('Error', `Failed to place order: ${err.response?.status || err.message}`);
    } finally {
      setOrdering(false);
    }
  };
 
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#39d353" />
      </View>
    );
  }
 
  const totalAmount = cart?.items?.reduce(
    (sum, item) => sum + item.productId.price * item.quantity, 0
  ) || 0;
 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Cart 🛍️</Text>
 
      {!cart?.items?.length ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Your cart is empty!</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/products')}>
            <Text style={styles.shopButtonText}>Shop Now 🛒</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart.items}
            keyExtractor={(item) => item.productId._id}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Text style={styles.itemEmoji}>🥛</Text>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.productId.name}</Text>
                  <Text style={styles.itemPrice}>
                    ₹{item.productId.price} x {item.quantity}
                  </Text>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemTotal}>
                    ₹{item.productId.price * item.quantity}
                  </Text>
                  <TouchableOpacity onPress={() => removeItem(item.productId._id)}>
                    <Text style={styles.removeBtn}>❌</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
 
          <View style={styles.footer}>
            <Text style={styles.totalText}>Total: ₹{totalAmount}</Text>
            <TouchableOpacity
              style={styles.orderButton}
              onPress={placeOrder}
              disabled={ordering}>
              {ordering
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.orderButtonText}>Place Order →</Text>
              }
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
    padding: 16,
    paddingTop: 50,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    marginBottom: 16,
  },
  shopButton: {
    backgroundColor: '#39d353',
    borderRadius: 10,
    padding: 14,
    paddingHorizontal: 24,
  },
  shopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  itemPrice: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemTotal: {
    color: '#39d353',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  removeBtn: {
    fontSize: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  totalText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  orderButton: {
    backgroundColor: '#39d353',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});