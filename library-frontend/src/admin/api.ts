import axios from 'axios';
import { Platform } from 'react-native';

const getHost = () => {
  const envHost = process.env.EXPO_PUBLIC_API_HOST;
  if (envHost && envHost.trim()) return envHost.trim();
  return 'localhost';
};

const HOST = Platform.OS === 'web' ? getHost() : getHost();
export const BASE_URL = `http://${HOST}:5000/api/admin`;

let token: string | null = null;
export const setToken = (t: string | null) => { token = t; };

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });
api.interceptors.request.use((cfg) => {
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const errMsg = (e: any): string =>
  e?.response?.data?.message || e?.message || 'Something went wrong';
export default api;
