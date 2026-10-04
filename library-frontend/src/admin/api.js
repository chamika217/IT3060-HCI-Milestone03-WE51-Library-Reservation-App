import axios from 'axios';

// CHANGE the IP to your PC's WiFi IPv4 (run `ipconfig`)
export const BASE_URL = 'http://192.168.1.5:5000/api/admin';

let token = null;
export const setToken = (t) => { token = t; };

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });
api.interceptors.request.use((cfg) => {
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';
export default api;
