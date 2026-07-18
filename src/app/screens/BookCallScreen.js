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
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import Toast from './Toast';
 
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
  const { colors, isDark } = useTheme();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '' });
 
  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  };
 
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
      showToast("Call booked! We'll contact you at your selected time. 📞");
      setTimeout(() => router.back(), 1500);
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
 
  const s = getStyles(colors);
 
  return (
    <ScrollView style={s.container} contentContainerStyle={s.contentContainer}>
      <Toast message={toast.message} visible={toast.visible} />
      <View style={s.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Book a Discovery Call 📞</Text>
      </View>
 
      <Text style={s.subtitle}>
        Pick a date and time that works for you — we'll give you a call.
      </Text>
 
      <View style={s.calendarCard}>
        <Calendar
          minDate={getTodayString()}
          onDayPress={handleDayPress}
          markedDates={markedDates}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            textSectionTitleColor: colors.textMuted,
            dayTextColor: colors.text,
            todayTextColor: '#39d353',
            selectedDayBackgroundColor: '#39d353',
            selectedDayTextColor: '#000',
            monthTextColor: colors.text,
            arrowColor: '#39d353',
            textDisabledColor: colors.textFaint,
            textMonthFontWeight: 'bold',
            textDayFontSize: 14,
            textMonthFontSize: 16,
          }}
        />
      </View>
 
      {selectedDate && (
        <>
          <Text style={s.sectionHeading}>Available Slots</Text>
          {loadingSlots ? (
            <ActivityIndicator color="#39d353" style={{ marginVertical: 20 }} />
          ) : (
            <View style={s.slotsGrid}>
              {ALL_SLOTS.map((slot) => {
                const isBooked = bookedSlots.includes(slot);
                const isSelected = selectedSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    disabled={isBooked}
                    style={[
                      s.slotButton,
                      isBooked && s.slotButtonDisabled,
                      isSelected && s.slotButtonSelected
                    ]}
                    onPress={() => setSelectedSlot(slot)}>
                    <Text
                      style={[
                        s.slotText,
                        isBooked && s.slotTextDisabled,
                        isSelected && s.slotTextSelected
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
          <Text style={s.sectionHeading}>Your Details</Text>
          <View style={s.formCard}>
            <TextInput
              style={s.input}
              placeholder="Full Name"
              placeholderTextColor={colors.textFaint}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={s.input}
              placeholder="Phone Number"
              placeholderTextColor={colors.textFaint}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={s.input}
              placeholder="Email Address"
              placeholderTextColor={colors.textFaint}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
 
          <TouchableOpacity
            style={s.submitButton}
            onPress={handleSubmit}
            disabled={submitting}>
            {submitting
              ? <ActivityIndicator color="#000" />
              : <Text style={s.submitButtonText}>Confirm Booking →</Text>
            }
          </TouchableOpacity>
        </>
      )}
 
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
    title: { fontSize: 20, fontWeight: 'bold', color: colors.text, flexShrink: 1 },
    subtitle: {
      color: colors.textMuted,
      fontSize: 13,
      marginHorizontal: 20,
      marginBottom: 16,
      lineHeight: 19,
    },
    calendarCard: {
      marginHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionHeading: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
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
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingVertical: 12,
      marginBottom: 10,
      marginHorizontal: 4,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    slotButtonDisabled: {
      backgroundColor: colors.background,
    },
    slotButtonSelected: {
      backgroundColor: 'rgba(57,211,83,0.15)',
      borderColor: '#39d353',
    },
    slotText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    slotTextDisabled: {
      color: colors.textFaint,
    },
    slotTextSelected: {
      color: colors.text,
    },
    formCard: {
      marginHorizontal: 20,
    },
    input: {
      backgroundColor: colors.inputBg,
      borderRadius: 10,
      padding: 14,
      color: colors.text,
      marginBottom: 12,
      fontSize: 15,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: '#000',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
}