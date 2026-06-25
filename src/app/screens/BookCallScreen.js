import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import api from '../services/api';
 
const ALL_SLOTS = [
  '10:00 AM - 10:30 AM', '10:30 AM - 11:00 AM',
  '11:00 AM - 11:30 AM', '11:30 AM - 12:00 PM',
  '12:00 PM - 12:30 PM', '12:30 PM - 1:00 PM',
  '1:00 PM - 1:30 PM', '1:30 PM - 2:00 PM',
  '2:00 PM - 2:30 PM', '2:30 PM - 3:00 PM',
  '3:00 PM - 3:30 PM', '3:30 PM - 4:00 PM',
  '4:00 PM - 4:30 PM', '4:30 PM - 5:00 PM',
  '5:00 PM - 5:30 PM', '5:30 PM - 6:00 PM'
];
 
const getTodayString = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};
 
export default function BookCallScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
 
  useEffect(() => {
    loadUser();
  }, []);
 
  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        setName(user.name || '');
        setPhone(user.phone || '');
        setEmail(user.email || '');
      }
    } catch (err) {
      console.log('LOAD USER ERROR:', err.message);
    }
  };
 
  const fetchAvailability = async (date) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const res = await api.get(`/api/bookings/availability/${date}`);
      setBookedSlots(res.data.bookedSlots || []);
    } catch (err) {
      console.log('AVAILABILITY ERROR:', err.message);
      console.log('AVAILABILITY ERROR RESPONSE:', err.response?.data);
      Alert.alert('Error', 'Failed to load available slots');
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };
 
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    fetchAvailability(day.dateString);
  };
 
  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) {
      Alert.alert('Missing info', 'Please select a date and time slot.');
      return;
    }
    if (!name.trim() || !phone.trim() || !email.trim()) {
      Alert.alert('Missing info', 'Please fill in your name, phone, and email.');
      return;
    }
 
    setSubmitting(true);
    try {
      await api.post('/api/bookings/create', {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        date: selectedDate,
        timeSlot: selectedSlot
      });
      Alert.alert('Booked! 🎉', "We'll call you at your selected time.", [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err) {
      console.log('BOOKING ERROR:', err.message);
      console.log('BOOKING ERROR RESPONSE:', err.response?.data);
      if (err.response?.status === 409) {
        Alert.alert('Slot unavailable', 'This slot was just booked. Please choose another.');
        fetchAvailability(selectedDate);
        setSelectedSlot(null);
      } else {
        Alert.alert('Error', 'Failed to book your call. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };
 
  const markedDates = selectedDate
    ? { [selectedDate]: { selected: true, selectedColor: '#39d353' } }
    : {};
 
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Book a Discovery Call 📞</Text>
      </View>
 
      <Text style={styles.subtitle}>
        Pick a date and time that works for you — we'll give you a call.
      </Text>
 
      <View style={styles.calendarCard}>
        <Calendar
          minDate={getTodayString()}
          onDayPress={handleDayPress}
          markedDates={markedDates}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            textSectionTitleColor: 'rgba(255,255,255,0.5)',
            dayTextColor: '#fff',
            todayTextColor: '#39d353',
            selectedDayBackgroundColor: '#39d353',
            selectedDayTextColor: '#fff',
            monthTextColor: '#fff',
            arrowColor: '#39d353',
            textDisabledColor: 'rgba(255,255,255,0.2)',
            textMonthFontWeight: 'bold',
            textDayFontSize: 14,
            textMonthFontSize: 16,
          }}
        />
      </View>
 
      {selectedDate && (
        <>
          <Text style={styles.sectionHeading}>Available Slots</Text>
          {loadingSlots ? (
            <ActivityIndicator color="#39d353" style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.slotsGrid}>
              {ALL_SLOTS.map((slot) => {
                const isBooked = bookedSlots.includes(slot);
                const isSelected = selectedSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    disabled={isBooked}
                    style={[
                      styles.slotButton,
                      isBooked && styles.slotButtonDisabled,
                      isSelected && styles.slotButtonSelected
                    ]}
                    onPress={() => setSelectedSlot(slot)}>
                    <Text
                      style={[
                        styles.slotText,
                        isBooked && styles.slotTextDisabled,
                        isSelected && styles.slotTextSelected
                      ]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </>
      )}
 
      {selectedDate && selectedSlot && (
        <>
          <Text style={styles.sectionHeading}>Your Details</Text>
          <View style={styles.formCard}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
 
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting}>
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitButtonText}>Confirm Booking →</Text>
            }
          </TouchableOpacity>
        </>
      )}
 
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
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff', flexShrink: 1 },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginHorizontal: 20,
    marginBottom: 16,
    lineHeight: 19,
  },
  calendarCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 8,
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#39d353',
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 20,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    justifyContent: 'space-between',
  },
  slotButton: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  slotButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  slotButtonSelected: {
    backgroundColor: 'rgba(57,211,83,0.15)',
    borderColor: '#39d353',
  },
  slotText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  slotTextDisabled: {
    color: 'rgba(255,255,255,0.25)',
  },
  slotTextSelected: {
    color: '#39d353',
  },
  formCard: {
    marginHorizontal: 20,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    marginBottom: 12,
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: '#39d353',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});