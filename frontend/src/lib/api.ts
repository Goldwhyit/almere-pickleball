import axios from 'axios';
import { getApiBaseUrl } from './apiBase';

const API_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests (skip for public/auth endpoints)
api.interceptors.request.use((config) => {
  const url = config.url ?? '';
  const isAuthFree = url.includes('/auth/login') || url.includes('/trial-lessons/signup');

  if (!isAuthFree) {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
