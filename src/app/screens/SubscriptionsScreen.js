import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

const PLANS = [
  {
    id: 'starter',
    name: 'STARTER',
    accentColor: '#4fc3f7',
    price: 1400,
    features: ['500ml A2 Milk Daily', '250g Curd Weekly', 'Free Delivery', 'WhatsApp Updates'],
    popular: false,
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    accentColor: '#39d353',
    price: 3200,
    features: [
      '1L A2 Milk Daily',
      '500g Ghee Monthly',
      '400g Paneer Weekly',
      '400g Dahi Weekly',
      'Free Priority Delivery',
      'Dedicated Manager',
    ],
    popular: true,
  },
  {
    id: 'family',
    name: 'FAMILY',
    accentColor: '#f9c74f',
    price: 5600,
    features: [
      '2L A2 Milk Daily',
      '1Kg Ghee Monthly',
      '500g Paneer Twice/Week',
      'Seasonal Products',
      'Doorstep Delivery 5AM',
      'WhatsApp Bot Ordering',
      'Monthly Farm Visit',
    ],
    popular: false,
  },
];

export default function SubscriptionsScreen() {
  const { colors } = useTheme();
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState(null);
  const s = getStyles(colors);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      const res = await api.get(`/api/subscriptions/${user.id}`);
      // Find the most recent active PLAN-type subscription
      const activePlan = res.data.find(sub => sub.type === 'plan' && sub.status === 'active');
      setActiveSubscription(activePlan || null);
    } catch (err) {
      // no active subscription is fine, not an error state
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPlan = async (plan) => {
    setSubscribingId(plan.id);
    try {
      // 1. Create Razorpay order for this month's price
      const orderRes = await api.post('/api/payment/create-order', {
        amount: plan.price,
      });
      const razorpayOrder = orderRes.data;

      // 2. Open Razorpay checkout
      const paymentData = await RazorpayCheckout.open({
        description: `${plan.name} Subscription`,
        currency: 'INR',
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        order_id: razorpayOrder.id,
        name: 'CNN Farm Hub',
        theme: { color: '#39d353' },
      });

      // 3. Verify payment
      const verifyRes = await api.post('/api/payment/verify-payment', {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      });

      if (!verifyRes.data.verified) {
        Alert.alert('Payment Failed', 'Payment verification failed. Please try again.');
        return;
      }

      // 4. Create subscription record
      await api.post('/api/subscriptions/create', {
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        features: plan.features,
        paymentId: paymentData.razorpay_payment_id,
        paymentStatus: 'paid',
      });

      Alert.alert('Subscribed! 🎉', `You're now on the ${plan.name} plan.`);
      fetchSubscription();
    } catch (err) {
      if (err.code === 0 || err.description) {
        Alert.alert('Payment Cancelled', 'Payment was cancelled or failed.');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } finally {
      setSubscribingId(null);
    }
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color="#39d353" />
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Subscriptions</Text>
      <Text style={s.subtitle}>Choose a plan that fits your family 🥛</Text>

      {activeSubscription && (
        <View style={s.activeCard}>
          <Text style={s.activeCardTitle}>✅ Active: {activeSubscription.planName}</Text>
          <Text style={s.activeCardText}>
            ₹{activeSubscription.price}/month • Next billing: {new Date(activeSubscription.nextBillingDate).toLocaleDateString()}
          </Text>
        </View>
      )}

      {PLANS.map((plan) => {
        const isCurrentPlan = activeSubscription?.planId === plan.id;
        return (
          <View
            key={plan.id}
            style={[
              s.planCard,
              plan.popular && s.planCardPopular,
              isCurrentPlan && s.planCardSelected,
            ]}>
            {plan.popular && (
              <View style={s.popularBadge}>
                <Text style={s.popularBadgeText}>★ MOST POPULAR</Text>
              </View>
            )}

            <Text style={[s.planName, { color: plan.accentColor }]}>{plan.name}</Text>

            <View style={s.priceRow}>
              <Text style={s.priceText}>₹{plan.price.toLocaleString('en-IN')}</Text>
              <Text style={s.priceUnit}>/month</Text>
            </View>
            <Text style={s.billedText}>Billed monthly</Text>

            <View style={s.featuresList}>
              {plan.features.map((feature, i) => (
                <View key={i} style={s.featureRow}>
                  <Text style={[s.checkIcon, { color: plan.accentColor }]}>✓</Text>
                  <Text style={s.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[
                s.selectButton,
                plan.popular && s.selectButtonPopular,
                isCurrentPlan && s.selectButtonSelected,
              ]}
              disabled={isCurrentPlan || subscribingId === plan.id}
              onPress={() => subscribeToPlan(plan)}>
              {subscribingId === plan.id ? (
                <ActivityIndicator color={plan.popular ? '#0a0a0a' : colors.text} />
              ) : (
                <Text
                  style={[
                    s.selectButtonText,
                    (plan.popular || isCurrentPlan) && s.selectButtonTextOnColor,
                  ]}>
                  {isCurrentPlan ? '✓ Current Plan' : 'Select Plan'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        );
      })}

      <TouchableOpacity style={s.browseButton} onPress={() => router.push('/products')}>
        <Text style={s.browseButtonText}>Or browse individual products →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingTop: 50,
      paddingBottom: 40,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 20,
    },
    activeCard: {
      backgroundColor: 'rgba(57,211,83,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(57,211,83,0.3)',
      borderRadius: 14,
      padding: 16,
      marginBottom: 20,
    },
    activeCardTitle: {
      color: '#1a9e46',
      fontWeight: 'bold',
      fontSize: 15,
      marginBottom: 4,
    },
    activeCardText: {
      color: colors.textMuted,
      fontSize: 13,
    },
    planCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    planCardPopular: {
      borderColor: '#39d353',
      borderWidth: 2,
      shadowColor: '#39d353',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    planCardSelected: {
      borderColor: colors.accent,
      borderWidth: 2,
    },
    popularBadge: {
      backgroundColor: '#39d353',
      alignSelf: 'center',
      paddingVertical: 6,
      paddingHorizontal: 18,
      borderRadius: 20,
      marginBottom: 16,
      marginTop: -36,
    },
    popularBadgeText: {
      color: '#0a0a0a',
      fontWeight: 'bold',
      fontSize: 12,
      letterSpacing: 0.5,
    },
    planName: {
      fontSize: 14,
      fontWeight: 'bold',
      letterSpacing: 1,
      marginBottom: 12,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: 2,
    },
    priceText: {
      fontSize: 36,
      fontWeight: 'bold',
      color: colors.text,
    },
    priceUnit: {
      fontSize: 15,
      color: colors.textMuted,
      marginLeft: 6,
      marginBottom: 6,
    },
    billedText: {
      fontSize: 13,
      color: colors.textFaint,
      marginBottom: 20,
    },
    featuresList: {
      marginBottom: 24,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    checkIcon: {
      fontSize: 15,
      fontWeight: 'bold',
      marginRight: 10,
      width: 16,
    },
    featureText: {
      fontSize: 14,
      color: colors.text,
    },
    selectButton: {
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    selectButtonPopular: {
      backgroundColor: '#39d353',
    },
    selectButtonSelected: {
      backgroundColor: colors.accent,
    },
    selectButtonText: {
      fontWeight: 'bold',
      fontSize: 15,
      color: colors.text,
    },
    selectButtonTextOnColor: {
      color: '#0a0a0a',
    },
    browseButton: {
      alignItems: 'center',
      paddingVertical: 16,
    },
    browseButtonText: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '600',
    },
  });
}