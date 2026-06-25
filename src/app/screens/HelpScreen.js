import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
 
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
 
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support 🌿</Text>
      </View>
 
      {/* Contact Us */}
      <View style={styles.contactCard}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.sectionSubtext}>We're here to help — reach out anytime</Text>
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactLabel}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={handleWhatsApp}>
            <Text style={styles.contactIcon}>💬</Text>
            <Text style={styles.contactLabel}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
            <Text style={styles.contactIcon}>✉️</Text>
            <Text style={styles.contactLabel}>Email</Text>
          </TouchableOpacity>
        </View>
      </View>
 
      {/* Book a Discovery Call */}
      <TouchableOpacity style={styles.bookCallCard} onPress={() => router.push('/book-call')}>
        <Text style={styles.bookCallIcon}>📅</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.bookCallTitle}>Book a Discovery Call</Text>
          <Text style={styles.bookCallSubtext}>Schedule a time for us to call you</Text>
        </View>
        <Text style={styles.bookCallArrow}>→</Text>
      </TouchableOpacity>
 
      {/* App Usage Tips */}
      <Text style={styles.sectionHeading}>Getting Started</Text>
      <View style={styles.tipsCard}>
        {TIPS.map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <Text style={styles.tipIcon}>{tip.icon}</Text>
            <Text style={styles.tipText}>{tip.text}</Text>
          </View>
        ))}
      </View>
 
      {/* FAQ */}
      <Text style={styles.sectionHeading}>Frequently Asked Questions</Text>
      <View style={styles.faqContainer}>
        {FAQS.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.faqItem}
            onPress={() => toggleFaq(index)}
            activeOpacity={0.7}>
            <View style={styles.faqQuestionRow}>
              <Text style={styles.faqQuestion}>{item.q}</Text>
              <Text style={styles.faqChevron}>{openFaq === index ? '−' : '+'}</Text>
            </View>
            {openFaq === index && (
              <Text style={styles.faqAnswer}>{item.a}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
 
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backArrow: { color: '#fff', fontSize: 18 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  contactCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: 'rgba(57,211,83,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(57,211,83,0.3)',
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  sectionSubtext: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16 },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between' },
  contactButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 4,
  },
  contactIcon: { fontSize: 24, marginBottom: 6 },
  contactLabel: { color: '#fff', fontSize: 12, fontWeight: '600' },
  bookCallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
  },
  bookCallIcon: { fontSize: 24, marginRight: 14 },
  bookCallTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  bookCallSubtext: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  bookCallArrow: { color: '#39d353', fontSize: 18, fontWeight: 'bold' },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#39d353',
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  tipsCard: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
  },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  tipIcon: { fontSize: 18, marginRight: 12, width: 24 },
  tipText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, flex: 1, lineHeight: 19 },
  faqContainer: { marginHorizontal: 20 },
  faqItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1, marginRight: 10 },
  faqChevron: { color: '#39d353', fontSize: 18, fontWeight: 'bold' },
  faqAnswer: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 10, lineHeight: 19 },
});