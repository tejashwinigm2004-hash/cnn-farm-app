import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
 
const FAQS = [
  {
    q: 'What time does delivery happen?',
    a: 'We deliver fresh dairy products every morning by 6 AM, straight from our farm to your doorstep.',
    keywords: ['delivery', 'time', 'when', 'morning', 'deliver'],
  },
  {
    q: 'How do I track my order?',
    a: 'Open "My Orders" from the Home screen to see the status of all your past and current orders.',
    keywords: ['track', 'order', 'status', 'where'],
  },
  {
    q: 'Can I cancel or change my order?',
    a: "You can remove items from your cart before placing the order. For changes after placing an order, please contact us via call or WhatsApp.",
    keywords: ['cancel', 'change', 'modify', 'edit'],
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We currently support cash on delivery. Online payment options are coming soon.',
    keywords: ['payment', 'pay', 'cash', 'card', 'upi', 'money'],
  },
  {
    q: 'How do I add items to my cart?',
    a: 'Go to "Shop Now" from the Home screen, browse our products, and tap "Add to Cart" on any item you\'d like to order.',
    keywords: ['cart', 'add', 'buy', 'shop', 'order'],
  },
  {
    q: 'Is the milk and dairy organic?',
    a: 'Yes! All our products are 100% organic, fresh, and free from preservatives — delivered directly from our farm.',
    keywords: ['organic', 'fresh', 'quality', 'preservative', 'natural'],
  },
  {
    q: 'Do you deliver on Sundays or holidays?',
    a: 'Yes, we deliver every day including Sundays and most holidays, so your fresh dairy never skips a beat!',
    keywords: ['sunday', 'holiday', 'everyday', 'weekend'],
  },
  {
    q: 'How do I contact support directly?',
    a: 'You can reach us anytime via Call, WhatsApp, or Email from the Help & Support screen — we usually respond quickly!',
    keywords: ['contact', 'support', 'help', 'call', 'whatsapp', 'email', 'reach'],
  },
  {
    q: "What if I'm not home for delivery?",
    a: "No worries! Our delivery partner will try to leave your order safely at your doorstep, or you can coordinate a different time by contacting support.",
    keywords: ['home', 'absent', 'miss', 'not there', 'away'],
  },
  {
    q: 'Do you offer discounts for bulk orders?',
    a: "We're working on bulk order discounts! For large or recurring orders, contact us directly via WhatsApp or email and we'll be happy to help.",
    keywords: ['discount', 'bulk', 'wholesale', 'large order', 'offer'],
  },
  {
    q: 'How do I book a discovery call?',
    a: 'Tap "Book a Call" on the Home screen or in Help & Support, then pick a date and time slot that works for you — we\'ll call you then!',
    keywords: ['book', 'call', 'discovery', 'schedule', 'appointment'],
  },
  {
    q: 'Do you offer subscriptions?',
    a: "Subscriptions are coming soon! We're working on flexible plans so you can get your favorite products delivered automatically.",
    keywords: ['subscribe', 'subscription', 'recurring', 'plan'],
  },
];
 
const WELCOME_MESSAGE = {
  id: 'welcome',
  fromBot: true,
  text: "Hi! I'm here to help with questions about CNN Milk. Tap a question below or type your own! 🌿",
};
 
const FALLBACK_TEXT =
  "I'm not quite sure about that one. Try asking about delivery, orders, payments, or booking a call — or reach our team directly via Help & Support!";
 
function findBestMatch(userText) {
  const lowerText = userText.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
 
  FAQS.forEach((faq) => {
    let score = 0;
    faq.keywords.forEach((kw) => {
      if (lowerText.includes(kw)) score += 1;
    });
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  });
 
  return bestScore > 0 ? bestMatch : null;
}
 
export default function ChatbotScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const scrollRef = useRef(null);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [suggestedFaqs, setSuggestedFaqs] = useState(FAQS.slice(0, 6));
 
  const scrollToEnd = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };
 
  const sendUserMessage = (text) => {
    if (!text.trim()) return;
 
    const userMsg = { id: `u-${Date.now()}`, fromBot: false, text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
 
    const match = findBestMatch(text);
    const botText = match ? match.a : FALLBACK_TEXT;
 
    setTimeout(() => {
      const botMsg = { id: `b-${Date.now()}`, fromBot: true, text: botText };
      setMessages((prev) => [...prev, botMsg]);
      scrollToEnd();
    }, 400);
 
    scrollToEnd();
  };
 
  const handleChipPress = (faq) => {
    sendUserMessage(faq.q);
  };
 
  const s = getStyles(colors);
 
  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>CNN Assistant 🤖</Text>
      </View>
 
      <ScrollView
        ref={scrollRef}
        style={s.messagesArea}
        contentContainerStyle={s.messagesContent}
        onContentSizeChange={scrollToEnd}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              s.messageBubble,
              msg.fromBot ? s.botBubble : s.userBubble,
            ]}>
            <Text style={msg.fromBot ? s.botText : s.userText}>{msg.text}</Text>
          </View>
        ))}
 
        <View style={s.chipsContainer}>
          {suggestedFaqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={s.chip}
              onPress={() => handleChipPress(faq)}>
              <Text style={s.chipText}>{faq.q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
 
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder="Type your question..."
          placeholderTextColor={colors.textFaint}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendUserMessage(input)}
          returnKeyType="send"
        />
        <TouchableOpacity style={s.sendButton} onPress={() => sendUserMessage(input)}>
          <Text style={s.sendButtonText}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
 
function getStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
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
    title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    messagesArea: { flex: 1 },
    messagesContent: { paddingHorizontal: 20, paddingBottom: 16 },
    messageBubble: {
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      maxWidth: '85%',
    },
    botBubble: {
      backgroundColor: colors.inputBg,
      alignSelf: 'flex-start',
      borderTopLeftRadius: 4,
    },
    userBubble: {
      backgroundColor: 'rgba(57,211,83,0.12)',
      alignSelf: 'flex-end',
      borderTopRightRadius: 4,
    },
    botText: { color: colors.text, fontSize: 14, lineHeight: 20 },
    userText: { color: '#1a9e46', fontSize: 14, lineHeight: 20, fontWeight: '600' },
    chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
      gap: 8,
    },
    chip: {
      backgroundColor: 'rgba(57,211,83,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(57,211,83,0.3)',
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 14,
      marginRight: 8,
      marginBottom: 8,
    },
    chipText: { color: '#1a9e46', fontSize: 12, fontWeight: '600' },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    input: {
      flex: 1,
      backgroundColor: colors.inputBg,
      borderRadius: 24,
      paddingVertical: 12,
      paddingHorizontal: 18,
      color: colors.text,
      fontSize: 14,
      marginRight: 10,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#39d353',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  });
}