import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PressableScale from '../components/PressableScale';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import { registerForPushNotificationsAsync } from '../services/notifications';
import { handleTabBarScroll } from '../utils/tabBarAnimation';
 
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_COUNT = 5; // Home, Cart, Orders, Subscribe, Account
const ACCOUNT_TAB_CENTER_X = SCREEN_WIDTH - SCREEN_WIDTH / TAB_COUNT / 2;
const CHAT_BUTTON_SIZE = 56;
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
 
export default function HomeScreen() {
  const { colors } = useTheme();
  const [user, setUser] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showChatTooltip, setShowChatTooltip] = useState(true);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const chatBounceAnim = useRef(new Animated.Value(0)).current;
  const tooltipScaleAnim = useRef(new Animated.Value(0)).current;
 
  // Staggered hero entrance
  const tagFade = useRef(new Animated.Value(0)).current;
  const tagSlide = useRef(new Animated.Value(16)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(20)).current;
  const subFade = useRef(new Animated.Value(0)).current;
  const subSlide = useRef(new Animated.Value(20)).current;
  const btnFade = useRef(new Animated.Value(0)).current;
  const btnSlide = useRef(new Animated.Value(20)).current;
 
  // Section fade-up (below hero)
  const sectionFade = useRef(new Animated.Value(0)).current;
  const sectionSlide = useRef(new Animated.Value(30)).current;
 
  // Quick Actions — one-by-one stagger, triggered on scroll into view
  const actions = [
    { icon: '🛒', label: 'Shop Now', route: '/products' },
    { icon: '📦', label: 'My Orders', route: '/orders' },
    { icon: '🛍️', label: 'My Cart', route: '/cart' },
    { icon: '🔄', label: 'Subscribe', route: '/subscriptions' },
  ];
  const actionAnims = useRef(actions.map(() => ({
    fade: new Animated.Value(0),
    slide: new Animated.Value(24),
  }))).current;
  const actionsSectionY = useRef(0);
  const actionsRevealed = useRef(false);
 
  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    };
    loadUser();
    setupPushNotifications();
 
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();
 
    const chatBounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(chatBounceAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.timing(chatBounceAnim, { toValue: 0, duration: 550, useNativeDriver: true }),
        Animated.delay(900),
      ])
    );
    chatBounceLoop.start();
 
    if (showChatTooltip) {
      Animated.spring(tooltipScaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        delay: 1200,
        useNativeDriver: true,
      }).start();
    }
 
    const stagger = (fade, slide, delay) =>
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 600, delay, useNativeDriver: true }),
      ]);
 
    Animated.sequence([
      stagger(tagFade, tagSlide, 100),
      stagger(titleFade, titleSlide, 100),
      stagger(subFade, subSlide, 100),
      stagger(btnFade, btnSlide, 100),
    ]).start();
 
    Animated.parallel([
      Animated.timing(sectionFade, { toValue: 1, duration: 700, delay: 600, useNativeDriver: true }),
      Animated.timing(sectionSlide, { toValue: 0, duration: 700, delay: 600, useNativeDriver: true }),
    ]).start();
 
    return () => {
      pulseLoop.stop();
      chatBounceLoop.stop();
    };
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
 
  const revealActions = () => {
    if (actionsRevealed.current) return;
    actionsRevealed.current = true;
    Animated.stagger(
      150,
      actionAnims.map(({ fade, slide }) =>
        Animated.parallel([
          Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }),
          Animated.timing(slide, { toValue: 0, duration: 450, useNativeDriver: true }),
        ])
      )
    ).start();
  };
 
  const onHomeScroll = (e) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    handleTabBarScroll(scrollY);
    if (!actionsRevealed.current && scrollY + 550 > actionsSectionY.current) {
      revealActions();
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
 
  const handleAdminDashboard = () => {
    setMenuVisible(false);
    router.push('/admin-dashboard');
  };
 
  const s = getStyles(colors);
 
  const chatBounceTranslateY = chatBounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });
 
  return (
    <View style={s.wrapper}>
      <ScrollView
        style={s.container}
        onScroll={onHomeScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 90 }}>
 
        {/* HERO */}
        <View style={s.hero}>
          <View style={s.header}>
            <View style={s.brandRow}>
              <Image source={require('../../../assets/logo.png')} style={s.logoImage} />
              <View>
                <Text style={s.logoTextTop}>CNN Organic</Text>
                <Text style={s.logoTextBottom}>Fresh Farm</Text>
              </View>
            </View>
 
            <TouchableOpacity
              style={s.menuButton}
              onPress={() => setMenuVisible(true)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={s.menuDots}>☰</Text>
            </TouchableOpacity>
 
            <Modal
              visible={menuVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setMenuVisible(false)}>
              <Pressable style={s.menuOverlay} onPress={() => setMenuVisible(false)}>
                <View style={s.menuDropdown}>
                  <TouchableOpacity style={s.menuItem} onPress={handleHelp}>
                    <Text style={s.menuItemIcon}>❓</Text>
                    <Text style={s.menuItemText}>Help</Text>
                  </TouchableOpacity>
                  {user?.role === 'admin' && (
                    <>
                      <View style={s.menuDivider} />
                      <TouchableOpacity style={s.menuItem} onPress={handleAdminDashboard}>
                        <Text style={s.menuItemIcon}>🛡️</Text>
                        <Text style={s.menuItemText}>Admin Dashboard</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  <View style={s.menuDivider} />
                  <TouchableOpacity style={s.menuItem} onPress={handleLogout}>
                    <Text style={s.menuItemIcon}>🚪</Text>
                    <Text style={[s.menuItemText, s.logoutText]}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Modal>
          </View>
 
          <View style={s.heroContent}>
            <Animated.Text style={[s.heroTitle, { opacity: titleFade, transform: [{ translateY: titleSlide }] }]}>
              Pure Dairy{'\n'}
              <Text style={s.heroTitleAccent}>From Heart</Text> of{'\n'}Karnataka
            </Animated.Text>
 
            <Animated.Text style={[s.heroSubtitle, { opacity: subFade, transform: [{ translateY: subSlide }] }]}>
              Milk, ghee, paneer & more — straight from our farm to your doorstep every morning at 6AM.
            </Animated.Text>
 
            <Animated.View style={{ opacity: btnFade, transform: [{ translateY: btnSlide }] }}>
              <TouchableOpacity style={s.heroButton} onPress={() => router.push('/products')}>
                <Text style={s.heroButtonText}>Shop Now →</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
 
        {/* WELCOME CARD */}
        <Animated.View style={[s.welcomeCard, { opacity: sectionFade, transform: [{ translateY: sectionSlide }] }]}>
          <Text style={s.welcomeText}>Welcome back, {user?.name || 'Friend'}! 👋</Text>
          <Text style={s.welcomeSubtext}>Your fresh dairy is just a tap away 🥛</Text>
        </Animated.View>
 
        {/* QUICK ACTIONS — reveal one by one on scroll */}
        <Animated.View
          onLayout={(e) => {
            actionsSectionY.current = e.nativeEvent.layout.y;
            if (e.nativeEvent.layout.y < 550) {
              setTimeout(revealActions, 150);
            }
          }}
          style={{ opacity: sectionFade, transform: [{ translateY: sectionSlide }] }}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
          <View style={s.actionsGrid}>
            {actions.map((action, i) => (
              <Animated.View
 
                key={action.label}
                style={{
                  width: '95%',
                  margin: '2%',
                  opacity: actionAnims[i].fade,
                  transform: [{ translateY: actionAnims[i].slide }],
                }}>
                <PressableScale style={s.actionCard} onPress={() => router.push(action.route)}>
                  <Text style={s.actionIcon}>{action.icon}</Text>
                  <Text style={s.actionText}>{action.label}</Text>
                </PressableScale>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
 
        {/* BOOK A CALL */}
        <View style={s.bookCallRow}>
          <Animated.View
            style={[
              s.bookCallGlowWrapper,
              {
                opacity: sectionFade,
                transform: [
                  { translateY: sectionSlide },
                  { scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) },
                ],
                shadowOpacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] }),
              },
            ]}>
            <TouchableOpacity style={s.bookCallFullCard} onPress={() => router.push('/book-call')}>
              <Text style={s.actionIcon}>📅</Text>
              <Text style={s.actionText}>Book a Call →</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
 
        {/* ABOUT */}
        <Animated.View style={[s.aboutCard, { opacity: sectionFade, transform: [{ translateY: sectionSlide }] }]}>
          <Text style={s.aboutTitle}>Why CNN Farm Hub? 🌱</Text>
          <Text style={s.aboutText}>✅ 100% Organic & Fresh</Text>
          <Text style={s.aboutText}>✅ Delivered by 6AM daily</Text>
          <Text style={s.aboutText}>✅ Direct from farm</Text>
          <Text style={s.aboutText}>✅ No preservatives</Text>
        </Animated.View>
      </ScrollView>
 
      <View style={s.floatingChatWrapper}>
        <Animated.View style={{ transform: [{ translateY: chatBounceTranslateY }] }}>
          <TouchableOpacity
            style={s.floatingChatButton}
            onPress={() => router.push('/chatbot')}
            activeOpacity={0.85}>
            <Text style={s.floatingChatIcon}>🤖</Text>
          </TouchableOpacity>
        </Animated.View>
 
        {showChatTooltip && (
          <AnimatedTouchableOpacity
            style={[
              s.chatTooltip,
              {
                opacity: tooltipScaleAnim,
                transform: [{ translateY: -22 }, { scale: tooltipScaleAnim }],
              },
            ]}
            onPress={() => setShowChatTooltip(false)}
            activeOpacity={0.9}>
            <Text style={s.chatTooltipText}>Need help?{'\n'}Chat with us!</Text>
            <View style={s.chatTooltipArrow} />
          </AnimatedTouchableOpacity>
        )}
      </View>
    </View>
  );
}
 
function getStyles(colors) {
  return StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
 
    hero: { position: 'relative', paddingBottom: 30, overflow: 'hidden', backgroundColor: colors.card },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
    brandRow: { flexDirection: 'row', alignItems: 'center' },
    logoImage: { width: 44, height: 44, borderRadius: 22, marginRight: 10 },
    logoTextTop: { fontSize: 18, fontWeight: 'bold', color: colors.accent },
    logoTextBottom: { fontSize: 14, fontWeight: '600', color: colors.accent },
    menuButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.inputBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuDots: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
    menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
    menuDropdown: {
      position: 'absolute',
      top: 95,
      right: 20,
      backgroundColor: colors.card,
      borderRadius: 14,
      paddingVertical: 6,
      minWidth: 160,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
    menuItemIcon: { fontSize: 16, marginRight: 10 },
    menuItemText: { color: colors.text, fontSize: 15, fontWeight: '600' },
    logoutText: { color: colors.danger },
    menuDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: 8 },
 
    heroContent: { paddingHorizontal: 20, marginTop: 10 },
    badge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(232,163,61,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(232,163,61,0.35)',
      borderRadius: 20,
      paddingVertical: 6,
      paddingHorizontal: 14,
      marginBottom: 18,
    },
    badgeText: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
    heroTitle: { fontSize: 34, fontWeight: 'bold', color: colors.text, lineHeight: 42, marginBottom: 14 },
    heroTitleAccent: { color: colors.accent },
    heroSubtitle: { fontSize: 14, color: colors.textMuted, lineHeight: 21, marginBottom: 24 },
    heroButton: {
      backgroundColor: colors.accent,
      borderRadius: 30,
      paddingVertical: 14,
      paddingHorizontal: 28,
      alignSelf: 'flex-start',
    },
    heroButtonText: { color: '#0a0a0a', fontWeight: 'bold', fontSize: 15 },
 
    welcomeCard: {
      margin: 20,
      padding: 20,
      backgroundColor: 'rgba(232,163,61,0.08)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(232,163,61,0.3)',
    },
    welcomeText: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 6 },
    welcomeSubtext: { fontSize: 14, color: colors.textMuted },
 
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginHorizontal: 20, marginBottom: 12, marginTop: 4 },
 
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 4 },
    actionCard: {
      height: 100,
      backgroundColor: 'rgba(232,163,61,0.08)',
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(232,163,61,0.3)',
    },
    actionIcon: { fontSize: 32, marginBottom: 8 },
    actionText: { color: colors.text, fontWeight: '600', fontSize: 14 },
 
    bookCallRow: { paddingHorizontal: 12, marginBottom: 8 },
    bookCallGlowWrapper: {
      width: '95%',
      marginHorizontal: '2%',
      borderRadius: 16,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 14,
      elevation: 100,
    },
    bookCallFullCard: {
      backgroundColor: 'rgba(232,163,61,0.3)',
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
 
    aboutCard: {
      margin: 20,
      padding: 20,
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 40,
      borderWidth: 1,
      borderColor: colors.border,
    },
    aboutTitle: { fontSize: 16, fontWeight: 'bold', color: colors.accent, marginBottom: 12 },
    aboutText: { color: colors.textMuted, fontSize: 14, marginBottom: 6 },
 
    floatingChatWrapper: {
      position: 'absolute',
      bottom: 88,
      left: ACCOUNT_TAB_CENTER_X - CHAT_BUTTON_SIZE / 2,
      zIndex: 999,
      elevation: 20,
    },
    chatTooltip: {
      position: 'absolute',
      top: '50%',
      right: CHAT_BUTTON_SIZE + 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 14,
      width: 150,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 6,
    },
    chatTooltipText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'right',
      lineHeight: 16,
    },
    chatTooltipArrow: {
      position: 'absolute',
      right: -11,
      top: '50%',
      marginTop: -9,
      width: 0,
      height: 0,
      borderTopWidth: 9,
      borderBottomWidth: 9,
      borderLeftWidth: 12,
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      borderLeftColor: '#ffffff',
    },
    floatingChatButton: {
      width: CHAT_BUTTON_SIZE,
      height: CHAT_BUTTON_SIZE,
      borderRadius: CHAT_BUTTON_SIZE / 2,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
    floatingChatIcon: {
      fontSize: 26,
    },
  });
}