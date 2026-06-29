import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import api from '../services/api';
 
export default function AdminProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [saving, setSaving] = useState(false);
 
  useEffect(() => {
    fetchProducts();
  }, []);
 
  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      console.log('ADMIN PRODUCTS ERROR:', err.message);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
 
  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };
 
  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setStock('');
    setModalVisible(true);
  };
 
  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(String(product.price));
    setStock(String(product.stock));
    setModalVisible(true);
  };
 
  const handleSave = async () => {
    if (!name.trim() || !price.trim() || !stock.trim()) {
      Alert.alert('Missing info', 'Please fill in name, price, and stock.');
      return;
    }
    const payload = {
      name: name.trim(),
      price: Number(price),
      stock: Number(stock),
    };
    setSaving(true);
    try {
      if (editingProduct) {
        await api.patch(`/api/admin/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/api/admin/products', payload);
      }
      setModalVisible(false);
      fetchProducts();
    } catch (err) {
      console.log('SAVE PRODUCT ERROR:', err.message);
      console.log('SAVE PRODUCT ERROR RESPONSE:', err.response?.data);
      Alert.alert('Error', 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };
 
  const handleDelete = (product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/admin/products/${product._id}`);
              setProducts((prev) => prev.filter((p) => p._id !== product._id));
            } catch (err) {
              console.log('DELETE PRODUCT ERROR:', err.message);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
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
        <Text style={styles.title}>Manage Products 🛒</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
 
      {!products.length ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No products yet.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#39d353" />
          }
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productMeta}>
                  ₹{item.price} · {item.stock > 0 ? `Stock: ${item.stock}` : 'Out of Stock'}
                </Text>
              </View>
              <TouchableOpacity style={styles.iconButton} onPress={() => openEditModal(item)}>
                <Text style={styles.iconText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleDelete(item)}>
                <Text style={styles.iconText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
 
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Product Name"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Price (₹)"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Stock"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSave}
                disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff', flex: 1 },
  addButton: {
    backgroundColor: '#39d353',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  productName: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  productMeta: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },
  iconButton: { paddingHorizontal: 8 },
  iconText: { fontSize: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#16203a',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 16 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    marginBottom: 12,
    fontSize: 15,
  },
  modalButtonRow: { flexDirection: 'row', marginTop: 8 },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  modalCancelText: { color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  modalSaveButton: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#39d353',
  },
  modalSaveText: { color: '#fff', fontWeight: 'bold' },
});
