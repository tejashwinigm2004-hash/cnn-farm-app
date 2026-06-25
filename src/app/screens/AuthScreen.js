import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
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
 
  const handleSubmit = async () => {
    console.log('Button pressed, mode:', mode);
    setLoading(true);
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body = mode === 'login'
        ? { email, password }
        : { name, email, phone, password };
 
      console.log('Sending request to:', url, 'with body:', body);
 
      const res = await api.post(url, body);
 
      console.log('Response received:', res.data);
 
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
 
      Alert.alert('Success', mode === 'login' ? 'Welcome back!' : 'Account created!');
      router.replace('/home');
    } catch (err) {
      console.log('ERROR CAUGHT:', err.message);
      console.log('ERROR RESPONSE:', err.response?.data);
      console.log('ERROR CODE:', err.code);
      Alert.alert('Error', `Message: ${err.message} | Code: ${err.code} | Response: ${JSON.stringify(err.response?.data)}`);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>🌿 CNN Farm Hub</Text>
      <Text style={styles.subtitle}>Fresh from our farm, daily</Text>
 
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, mode === 'login' && styles.activeTab]}
          onPress={() => setMode('login')}>
          <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'signup' && styles.activeTab]}
          onPress={() => setMode('signup')}>
          <Text style={[styles.tabText, mode === 'signup' && styles.activeTabText]}>Sign Up</Text>
        </TouchableOpacity>
      </View>
 
      {mode === 'signup' && (
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />
      )}
 
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
 
      {mode === 'signup' && (
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      )}
 
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
 
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>{mode === 'login' ? 'Login →' : 'Create Account →'}</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0a0f1e',
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
    marginBottom: 32,
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