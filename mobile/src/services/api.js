import axios from 'axios';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';

const defaultBaseUrl = Platform.OS === 'android'
  ? 'http://10.0.2.2:5000/api'
  : 'http://localhost:5000/api';

const manifestHost = Constants.expoConfig?.hostUri?.split(':')?.[0];
const lanBaseUrl = manifestHost ? `http://${manifestHost}:5000/api` : null;

const baseURL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  lanBaseUrl ||
  defaultBaseUrl;

console.log('📡 API baseURL:', baseURL);

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    // Token will be set by AppContext after login
    if (api.defaults.headers.common['Authorization']) {
      config.headers.Authorization = api.defaults.headers.common['Authorization'];
    }
    console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ Response error:', error.response.status, error.response.data);

      if (error.response.status === 403 && error.response.data?.message) {
        Alert.alert('Tài khoản bị khóa', error.response.data.message);
      }
    } else if (error.request) {
      console.error('❌ Network error:', error.message);
      console.error('Request config:', {
        baseURL: error.config?.baseURL,
        url: error.config?.url,
      });
    } else {
      console.error('❌ Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Helper to set auth token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('🔐 Auth token set');
  } else {
    delete api.defaults.headers.common['Authorization'];
    console.log('🔓 Auth token removed');
  }
};

export default api;
