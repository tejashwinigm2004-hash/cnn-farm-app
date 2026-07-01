import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
 
export default function AccountScreen() {
  const [user, setUser] = useState(null);
 
  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    };
    loadUser();
  }, []);
 
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('/auth');
  };
 
  const isAdmin = user?.role === 'admin';
 
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name || 'F')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Friend'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>
 
      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/orders')}>
          <Text style={styles.menuIcon}>📦</Text>
          <Text style={styles.menuText}>My Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/help')}>
          <Text style={styles.menuIcon}>❓</Text>
          <Text style={styles.menuText}>Help</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/book-call')}>
          <Text style={styles.menuIcon}>📅</Text>
          <Text style={styles.menuText}>Book a Call</Text>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin-dashboard')}>
            <Text style={styles.menuIcon}>🛡️</Text>
            <Text style={styles.menuText}>Admin Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>
 
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  content: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  profileCard: { alignItems: 'center', marginBottom: 30 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(57,211,83,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(57,211,83,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#39d353' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  menuList: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  menuIcon: { fontSize: 18, marginRight: 14 },
  menuText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  logoutButton: {
    backgroundColor: 'rgba(255,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.3)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#ff4444', fontSize: 15, fontWeight: 'bold' },
});
