import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../services/api';
import { registerForPushNotificationsAsync } from '../services/notifications';
 
export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;
 
  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    };
    loadUser();
    setupPushNotifications();
 
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
 
    return () => pulseLoop.stop();
  }, []);
 
  const setupPushNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await api.post('/api/auth/push-token', { pushToken: token });
        console.log('Push token sent to backend successfully');
      }
    } catch (err) {
      console.log('Push notification setup failed:', err.message);
    }
  };
 
  const handleLogout = async () => {
    setMenuVisible(false);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('/auth');
  };
 
  const handleHelp = () => {
    setMenuVisible(false);
    router.push('/help');
  };
 
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image source={require('../../../assets/logo.png')} style={styles.logoImage} />
          <View>
            <Text style={styles.logoTextTop}>CNN Organic</Text>
            <Text style={styles.logoTextBottom}>Fresh Farm</Text>
          </View>
        </View>
 
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.menuDots}>☰</Text>
        </TouchableOpacity>
 
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}>
          <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
            <View style={styles.menuDropdown}>
              <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
                <Text style={styles.menuItemIcon}>❓</Text>
                <Text style={styles.menuItemText}>Help</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Text style={styles.menuItemIcon}>🚪</Text>
                <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </View>
 
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Welcome back, {user?.name || 'Friend'}! 👋</Text>
        <Text style={styles.welcomeSubtext}>Your fresh dairy is just a tap away 🥛</Text>
      </View>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/products')}>
          <Text style={styles.actionIcon}>🛒</Text>
          <Text style={styles.actionText}>Shop Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/orders')}>
          <Text style={styles.actionIcon}>📦</Text>
          <Text style={styles.actionText}>My Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/cart')}>
          <Text style={styles.actionIcon}>🛍️</Text>
          <Text style={styles.actionText}>My Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/orders')}>
          <Text style={styles.actionIcon}>🔄</Text>
          <Text style={styles.actionText}>Subscribe</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bookCallRow}>
        <Animated.View
          style={[
            styles.bookCallGlowWrapper,
            {
              transform: [
                {
                  scale: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.03],
                  }),
                },
              ],
              shadowOpacity: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.25, 0.6],
              }),
            },
          ]}>
          <TouchableOpacity style={styles.bookCallFullCard} onPress={() => router.push('/book-call')}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>Book a Call →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      <View style={styles.aboutCard}>
        <Text style={styles.aboutTitle}>Why CNN Farm Hub? 🌱</Text>
        <Text style={styles.aboutText}>✅ 100% Organic & Fresh</Text>
        <Text style={styles.aboutText}>✅ Delivered by 6AM daily</Text>
        <Text style={styles.aboutText}>✅ Direct from farm</Text>
        <Text style={styles.aboutText}>✅ No preservatives</Text>
      </View>
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logoImage: { width: 44, height: 44, borderRadius: 22, marginRight: 10 },
  logoTextTop: { fontSize: 18, fontWeight: 'bold', color: '#E8A33D' },
  logoTextBottom: { fontSize: 14, fontWeight: '600', color: '#39d353' },
  tagline: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDots: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menuDropdown: {
    position: 'absolute',
    top: 95,
    right: 20,
    backgroundColor: '#16203a',
    borderRadius: 14,
    paddingVertical: 6,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemIcon: { fontSize: 16, marginRight: 10 },
  menuItemText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  logoutText: { color: '#ff4444' },
  menuDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 8 },
  welcomeCard: { margin: 20, padding: 20, backgroundColor: 'rgba(57,211,83,0.1)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(57,211,83,0.3)' },
  welcomeText: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  welcomeSubtext: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginHorizontal: 20, marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 4 },
  actionCard: { width: '46%', margin: '2%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, alignItems: 'center' },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  bookCallRow: { paddingHorizontal: 12, marginBottom: 20 },
  bookCallGlowWrapper: {
    width: '96%',
    marginHorizontal: '2%',
    borderRadius: 16,
    shadowColor: '#e2ccac',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 14,
    elevation: 10,
  },
  bookCallFullCard: { backgroundColor: '#E8A33D', borderRadius: 16, padding: 1, alignItems: 'center' },
  aboutCard: { margin: 20, padding: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, marginBottom: 40 },
  aboutTitle: { fontSize: 16, fontWeight: 'bold', color: '#39d353', marginBottom: 12 },
  aboutText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 6 },
});