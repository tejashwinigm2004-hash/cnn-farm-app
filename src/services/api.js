import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'https://cnn-project-97t2.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000, // 20 seconds — fails fast instead of hanging forever
});

// Auto attach token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;