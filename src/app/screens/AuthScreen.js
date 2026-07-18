import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import api from '../services/api';
 
export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '...' }
 
  const showMessage = (type, text) => {
    setMessage({ type, text });
    if (type === 'success') return; // keep success visible until redirect
    setTimeout(() => setMessage(null), 3500);
  };
 
  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body = mode === 'login'
        ? { email, password }
        : { name, email, phone, password };
 
      const res = await api.post(url, body);
 
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
 
      showMessage('success', mode === 'login' ? 'Welcome back!' : 'Account created!');
      setTimeout(() => router.replace('/home'), 1200);
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>CNN Farm Hub</Text>
        <Text style={styles.subtitle}>Fresh from our farm, daily</Text>
 
        {message && (
          <View style={[styles.messageBanner, message.type === 'error' ? styles.messageError : styles.messageSuccess]}>
            <Text style={message.type === 'error' ? styles.messageErrorText : styles.messageSuccessText}>
              {message.text}
            </Text>
          </View>
        )}
 
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, mode === 'login' && styles.activeTab]}
            onPress={() => { setMode('login'); setMessage(null); }}>
            <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'signup' && styles.activeTab]}
            onPress={() => { setMode('signup'); setMessage(null); }}>
            <Text style={[styles.tabText, mode === 'signup' && styles.activeTabText]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
 
        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={name}
            onChangeText={setName}
          />
        )}
 
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
 
        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        )}
 
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
 
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>{mode === 'login' ? 'Login' : 'Create Account'}</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
 
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#39d353',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 24,
  },
  messageBanner: {
    width: '100%',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
  },
  messageSuccess: {
    backgroundColor: 'rgba(57,211,83,0.12)',
    borderColor: 'rgba(57,211,83,0.35)',
  },
  messageError: {
    backgroundColor: 'rgba(255,68,68,0.12)',
    borderColor: 'rgba(255,68,68,0.35)',
  },
  messageSuccessText: {
    color: '#39d353',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  messageErrorText: {
    color: '#ff6b6b',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    width: '100%',
  },
  tab: {
    flex: 1,
    padding: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#39d353',
  },
  tabText: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    marginBottom: 14,
    fontSize: 15,
  },
  button: {
    width: '100%',
    backgroundColor: '#39d353',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});