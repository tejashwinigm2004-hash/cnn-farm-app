import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import { getProductImage } from '../utils/productImages';

export default function ProductsScreen({ navigation }) {
  const { colors } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      showMessage('error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    try {
      await api.post('/api/cart/add', {
        productId: product._id,
        quantity: 1,
      });
      showMessage('success', `${product.name} added to cart! 🛒`);
    } catch (err) {
      const status = err.response?.status;
      showMessage('error', `Failed to add to cart${status ? ` (${status})` : ''}`);
    }
  };

  const s = getStyles(colors);

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color="#39d353" />
        <Text style={s.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>Our Products 🥛</Text>

      {message && (
        <View style={[s.messageBanner, message.type === 'error' ? s.messageError : s.messageSuccess]}>
          <Text style={message.type === 'error' ? s.messageErrorText : s.messageSuccessText}>
            {message.text}
          </Text>
        </View>
      )}

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={s.productCard}>
            <Image source={getProductImage(item.name)} style={s.productImage} />
            <Text style={s.productName}>{item.name}</Text>
            <Text style={s.productPrice}>₹{item.price}</Text>
            <Text style={s.productStock}>
              {item.stock > 0 ? `In Stock: ${item.stock}` : 'Out of Stock'}
            </Text>
            <TouchableOpacity
              style={[s.addButton, item.stock === 0 && s.disabledButton]}
              onPress={() => addToCart(item)}
              disabled={item.stock === 0}
            >
              <Text style={s.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={s.centered}>
            <Text style={s.emptyText}>No products available</Text>
          </View>
        }
      />
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
    loadingText: {
      color: colors.textMuted,
      marginTop: 12,
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
    productCard: {
      flex: 1,
      margin: 8,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    productImage: {
      width: 80,
      height: 80,
      borderRadius: 12,
      marginBottom: 8,
    },
    productName: {
      color: colors.text,
      fontWeight: 'bold',
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 4,
    },
    productPrice: {
      color: '#39d353',
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    productStock: {
      color: colors.textMuted,
      fontSize: 12,
      marginBottom: 12,
    },
    addButton: {
      backgroundColor: '#39d353',
      borderRadius: 8,
      padding: 8,
      width: '100%',
      alignItems: 'center',
    },
    disabledButton: {
      backgroundColor: colors.border,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 12,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 16,
    },
  });
}