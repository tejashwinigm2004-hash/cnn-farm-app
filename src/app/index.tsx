import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import api from '../services/api';
 
export default function Index() {
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
 
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
 
        if (!token) {
          setIsLoggedIn(false);
          return;
        }
 
        // Validate the token against the backend rather than trusting
        // that its mere presence in storage means the user is logged in.
        await api.get('/api/auth/me');
        setIsLoggedIn(true);
      } catch (err) {
        // Token missing, expired, or invalid — clear stale data and
        // send the user to the login screen.
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setIsLoggedIn(false);
      } finally {
        setChecking(false);
      }
    };
 
    checkAuth();
  }, []);
 
  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0f1e' }}>
        <ActivityIndicator size="large" color="#39d353" />
      </View>
    );
  }
 
  return <Redirect href={isLoggedIn ? '/home' : '/auth'} />;
}