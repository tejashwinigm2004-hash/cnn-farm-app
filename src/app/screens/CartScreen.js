import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import { handleTabBarScroll, TAB_BAR_HEIGHT } from '../utils/tabBarAnimation';

export default function CartScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [message, setMessage] = useState(null);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchCart();
    }, [])
  );

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/cart/');
      setCart(res.data);
    } catch (err) {
      showMessage('error', `Failed to load cart${err.response?.status ? ` (${err.response.status})` : ''}`);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/api/cart/remove/${productId}`);
      fetchCart();
    } catch (err) {
      showMessage('error', 'Failed to remove item');
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
          image: item.productId.image,
          price: item.productId.price,
          quantity: item.quantity
        })),
        totalAmount,
        deliveryAddress: 'Default Address',
      });

      showMessage('success', 'Order placed! Pay from My Orders 🎉');
      setTimeout(() => router.push('/orders'), 1200);
    } catch (err) {
      showMessage('error', `Failed to place order${err.response?.status ? ` (${err.response.status})` : ''}`);
    } finally {
      setOrdering(false);
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

  const totalAmount = cart?.items?.reduce(
    (sum, item) => sum + item.productId.price * item.quantity, 0
  ) || 0;

  return (
    <View style={s.container}>
      <Text style={s.title}>My Cart 🛍️</Text>

      {message && (
        <View style={[s.messageBanner, message.type === 'error' ? s.messageError : s.messageSuccess]}>
          <Text style={message.type === 'error' ? s.messageErrorText : s.messageSuccessText}>
            {message.text}
          </Text>
        </View>
      )}

      {!cart?.items?.length ? (
        <View style={s.centered}>
          <Text style={s.emptyText}>Your cart is empty!</Text>
          <TouchableOpacity
            style={s.shopButton}
            onPress={() => router.push('/products')}>
            <Text style={s.shopButtonText}>Shop Now 🛒</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart.items}
            keyExtractor={(item) => item.productId._id}
            style={{ flex: 1 }}
            onScroll={(e) => handleTabBarScroll(e.nativeEvent.contentOffset.y)}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingBottom: 90 }}
            renderItem={({ item }) => (
              <View style={s.cartItem}>
                <Text style={s.itemEmoji}>🥛</Text>
                <View style={s.itemDetails}>
                  <Text style={s.itemName}>{item.productId.name}</Text>
                  <Text style={s.itemPrice}>
                    ₹{item.productId.price} x {item.quantity}
                  </Text>
                </View>
                <View style={s.itemRight}>
                  <Text style={s.itemTotal}>
                    ₹{item.productId.price * item.quantity}
                  </Text>
                  <TouchableOpacity onPress={() => removeItem(item.productId._id)}>
                    <Text style={s.removeBtn}>❌</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <View style={s.footer}>
            <Text style={s.totalText}>Total: ₹{totalAmount}</Text>
            <TouchableOpacity
              style={s.orderButton}
              onPress={placeOrder}
              disabled={ordering}>
              {ordering
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.orderButtonText}>Place Order →</Text>
              }
            </TouchableOpacity>
          </View>
        </>
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
    messageBanner: {
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
      borderWidth: 1,
    },
    messageSuccess: {
      backgroundColor: 'rgba(57,211,83,0.08)',
      borderColor: 'rgba(57,211,83,0.3)',
    },
    messageError: {
      backgroundColor: 'rgba(255,68,68,0.08)',
      borderColor: 'rgba(255,68,68,0.3)',
    },
    messageSuccessText: {
      color: '#1a9e46',
      fontWeight: '600',
      fontSize: 14,
    },
    messageErrorText: {
      color: '#d43333',
      fontWeight: '600',
      fontSize: 14,
    },
    emptyText: {
      color: colors.textMuted,
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
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemEmoji: { fontSize: 32, marginRight: 12 },
    itemDetails: { flex: 1 },
    itemName: { color: colors.text, fontWeight: 'bold', fontSize: 15 },
    itemPrice: { color: colors.textMuted, fontSize: 13 },
    itemRight: { alignItems: 'flex-end' },
    itemTotal: { color: '#39d353', fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
    removeBtn: { fontSize: 16 },
    footer: {
      padding: 16,
      paddingBottom: 16 + TAB_BAR_HEIGHT,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    totalText: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    orderButton: {
      backgroundColor: '#39d353',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    orderButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  });
}