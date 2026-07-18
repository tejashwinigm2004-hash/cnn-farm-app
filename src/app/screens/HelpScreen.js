import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
 
const PHONE_NUMBER = '8618854283';
const SUPPORT_EMAIL = 'cnnfarmhub@gmail.com';
 
const FAQS = [
  {
    q: 'What time does delivery happen?',
    a: 'We deliver fresh dairy products every morning by 6 AM, straight from our farm to your doorstep.',
  },
  {
    q: 'How do I track my order?',
    a: 'Open "My Orders" from the Home screen to see the status of all your past and current orders.',
  },
  {
    q: 'Can I cancel or change my order?',
    a: 'You can remove items from your cart before placing the order. For changes after placing an order, please contact us via call or WhatsApp.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We currently support cash on delivery. Online payment options are coming soon.',
  },
  {
    q: 'How do I add items to my cart?',
    a: 'Go to "Shop Now" from the Home screen, browse our products, and tap "Add to Cart" on any item you\'d like to order.',
  },
  {
    q: 'Is the milk and dairy organic?',
    a: 'Yes! All our products are 100% organic, fresh, and free from preservatives — delivered directly from our farm.',
  },
];
 
const TIPS = [
  { icon: '🛒', text: 'Tap "Shop Now" on the Home screen to browse all available products.' },
  { icon: '🛍️', text: 'Add items to your cart, then review them anytime from "My Cart".' },
  { icon: '📦', text: 'Check "My Orders" to see the status of everything you\'ve ordered.' },
  { icon: '⋮', text: 'Tap the menu icon (top right) anytime to reach Help or to Logout.' },
];
 
export default function HelpScreen() {
  const { colors } = useTheme();
  const [openFaq, setOpenFaq] = useState(null);
 
  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };
 
  const handleCall = () => {
    Linking.openURL(`tel:${PHONE_NUMBER}`);
  };
 
  const handleWhatsApp = () => {
    Linking.openURL(`https://wa.me/91${PHONE_NUMBER}`);
  };
 
  const handleEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };
 
  const s = getStyles(colors);
 
  return (
    <ScrollView style={s.container} contentContainerStyle={s.contentContainer}>
      <View style={s.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Help & Support 🌿</Text>
      </View>
 
      {/* Contact Us */}
      <View style={s.contactCard}>
        <Text style={s.sectionTitle}>Contact Us</Text>
        <Text style={s.sectionSubtext}>We're here to help — reach out anytime</Text>
        <View style={s.contactRow}>
          <TouchableOpacity style={s.contactButton} onPress={handleCall}>
            <Text style={s.contactIcon}>📞</Text>
            <Text style={s.contactLabel}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.contactButton} onPress={handleWhatsApp}>
            <Text style={s.contactIcon}>💬</Text>
            <Text style={s.contactLabel}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.contactButton} onPress={handleEmail}>
            <Text style={s.contactIcon}>✉️</Text>
            <Text style={s.contactLabel}>Email</Text>
          </TouchableOpacity>
        </View>
      </View>
 
      {/* Book a Discovery Call */}
      <TouchableOpacity style={s.bookCallCard} onPress={() => router.push('/book-call')}>
        <Text style={s.bookCallIcon}>📅</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.bookCallTitle}>Book a Discovery Call</Text>
          <Text style={s.bookCallSubtext}>Schedule a time for us to call you</Text>
        </View>
        <Text style={s.bookCallArrow}>→</Text>
      </TouchableOpacity>
 
      {/* App Usage Tips */}
      <Text style={s.sectionHeading}>Getting Started</Text>
      <View style={s.tipsCard}>
        {TIPS.map((tip, index) => (
          <View key={index} style={s.tipRow}>
            <Text style={s.tipIcon}>{tip.icon}</Text>
            <Text style={s.tipText}>{tip.text}</Text>
          </View>
        ))}
      </View>
 
      {/* FAQ */}
      <Text style={s.sectionHeading}>Frequently Asked Questions</Text>
      <View style={s.faqContainer}>
        {FAQS.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={s.faqItem}
            onPress={() => toggleFaq(index)}
            activeOpacity={0.7}>
            <View style={s.faqQuestionRow}>
              <Text style={s.faqQuestion}>{item.q}</Text>
              <Text style={s.faqChevron}>{openFaq === index ? '−' : '+'}</Text>
            </View>
            {openFaq === index && (
              <Text style={s.faqAnswer}>{item.a}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
 
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
 
function getStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    contentContainer: { paddingBottom: 20 },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      paddingTop: 50,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.inputBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    backArrow: { color: colors.text, fontSize: 18 },
    title: { fontSize: 22, fontWeight: 'bold', color: colors.text },
    contactCard: {
      margin: 20,
      marginTop: 0,
      padding: 20,
      backgroundColor: 'rgba(57,211,83,0.08)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(57,211,83,0.3)',
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
    sectionSubtext: { fontSize: 13, color: colors.textMuted, marginBottom: 16 },
    contactRow: { flexDirection: 'row', justifyContent: 'space-between' },
    contactButton: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 14,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    contactIcon: { fontSize: 24, marginBottom: 6 },
    contactLabel: { color: colors.text, fontSize: 12, fontWeight: '600' },
    bookCallCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      marginBottom: 20,
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bookCallIcon: { fontSize: 24, marginRight: 14 },
    bookCallTitle: { color: colors.text, fontWeight: 'bold', fontSize: 15 },
    bookCallSubtext: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    bookCallArrow: { color: '#39d353', fontSize: 18, fontWeight: 'bold' },
    sectionHeading: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#1a9e46',
      marginHorizontal: 20,
      marginBottom: 12,
      marginTop: 8,
    },
    tipsCard: {
      marginHorizontal: 20,
      marginBottom: 8,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
    tipIcon: { fontSize: 18, marginRight: 12, width: 24 },
    tipText: { color: colors.textMuted, fontSize: 13, flex: 1, lineHeight: 19 },
    faqContainer: { marginHorizontal: 20 },
    faqItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    faqQuestionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    faqQuestion: { color: colors.text, fontSize: 14, fontWeight: '600', flex: 1, marginRight: 10 },
    faqChevron: { color: '#1a9e46', fontSize: 18, fontWeight: 'bold' },
    faqAnswer: { color: colors.textMuted, fontSize: 13, marginTop: 10, lineHeight: 19 },
  });
}