import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
 
export default function DeliveryDetailsScreen() {
  const router = useRouter();
  const { cartItems, totalAmount } = useLocalSearchParams();
 
  const parsedCartItems = JSON.parse(cartItems);
  const parsedTotal = parseFloat(totalAmount);
 
  const [form, setForm] = useState({
    name: '',
    phone: '',
    altPhone: '',
    houseNo: '',
    street: '',
    landmark: '',
    city: '',
    pincode: '',
    deliveryInstructions: '',
    deliverySlot: 'Morning',
  });
 
  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
 
  const validate = () => {
    // ✅ street is now required — previously omitted here, which let orders
    // go through with an address like "3," (houseNo set, street blank),
    // which is unusable for delivery.
    if (!form.name || !form.phone || !form.houseNo || !form.street || !form.city || !form.pincode) {
      Alert.alert('Missing details', 'Please fill in all required fields.');
      return false;
    }
    if (form.phone.length !== 10) {
      Alert.alert('Invalid phone', 'Enter a valid 10-digit phone number.');
      return false;
    }
    if (form.pincode.length !== 6) {
      Alert.alert('Invalid pincode', 'Enter a valid 6-digit pincode.');
      return false;
    }
    return true;
  };
 
  const handleContinue = () => {
    if (!validate()) return;
 
    router.push({
      pathname: '/screens/OrderReview',
      params: {
        cartItems: JSON.stringify(parsedCartItems),
        totalAmount: parsedTotal.toString(),
        deliveryDetails: JSON.stringify(form),
      },
    });
  };
 
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Delivery Details</Text>
 
        <TextInput placeholder="Full Name *" placeholderTextColor="#888" value={form.name}
          onChangeText={v => updateField('name', v)} style={styles.input} />
        <TextInput placeholder="Phone Number *" placeholderTextColor="#888" value={form.phone}
          keyboardType="phone-pad" onChangeText={v => updateField('phone', v)}
          style={styles.input} maxLength={10} />
        <TextInput placeholder="Alternate Phone" placeholderTextColor="#888" value={form.altPhone}
          keyboardType="phone-pad" onChangeText={v => updateField('altPhone', v)}
          style={styles.input} maxLength={10} />
        <TextInput placeholder="House/Flat No. *" placeholderTextColor="#888" value={form.houseNo}
          onChangeText={v => updateField('houseNo', v)} style={styles.input} />
        <TextInput placeholder="Street / Area *" placeholderTextColor="#888" value={form.street}
          onChangeText={v => updateField('street', v)} style={styles.input} />
        <TextInput placeholder="Landmark" placeholderTextColor="#888" value={form.landmark}
          onChangeText={v => updateField('landmark', v)} style={styles.input} />
        <TextInput placeholder="City *" placeholderTextColor="#888" value={form.city}
          onChangeText={v => updateField('city', v)} style={styles.input} />
        <TextInput placeholder="Pincode *" placeholderTextColor="#888" value={form.pincode}
          keyboardType="number-pad" onChangeText={v => updateField('pincode', v)}
          style={styles.input} maxLength={6} />
        <TextInput placeholder="Delivery Instructions (optional)" placeholderTextColor="#888"
          value={form.deliveryInstructions}
          onChangeText={v => updateField('deliveryInstructions', v)}
          style={[styles.input, { height: 80 }]} multiline />
 
        <View style={styles.slotRow}>
          {['Morning', 'Evening'].map(slot => (
            <TouchableOpacity
              key={slot}
              style={[
                styles.slotBtn,
                form.deliverySlot === slot && styles.slotBtnActive,
              ]}
              onPress={() => updateField('deliverySlot', slot)}
            >
              <Text
                style={[
                  styles.slotBtnText,
                  form.deliverySlot === slot && styles.slotBtnTextActive,
                ]}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
 
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continue to Review</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F0F0F' },
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: '600', color: '#fff', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1A1A1A',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  slotRow: { flexDirection: 'row', marginBottom: 20, gap: 12 },
  slotBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  slotBtnActive: { backgroundColor: '#E8A33D', borderColor: '#E8A33D' },
  slotBtnText: { color: '#aaa', fontWeight: '600' },
  slotBtnTextActive: { color: '#0F0F0F' },
  continueBtn: {
    backgroundColor: '#E8A33D',
    padding: 14,
    borderRadius: 8,
    marginBottom: 30,
  },
  continueBtnText: { color: '#0F0F0F', textAlign: 'center', fontWeight: '700' },
});