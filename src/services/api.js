import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000/api/v1'; // Update this with your actual API URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email, password) => {
    const response = await api.post('/auth', { email, password });
    await AsyncStorage.setItem('auth_token', response.data.token);
    return response.data;
  },
  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
  },
};

export const groceryLists = {
  getAll: () => api.get('/grocery_lists'),
  getOne: (id) => api.get(`/grocery_lists/${id}`),
  create: (data) => api.post('/grocery_lists', data),
  update: (id, data) => api.put(`/grocery_lists/${id}`, data),
  delete: (id) => api.delete(`/grocery_lists/${id}`),
};

export const items = {
  getAll: (listId) => api.get(`/grocery_lists/${listId}/items`),
  getOne: (listId, itemId) => api.get(`/grocery_lists/${listId}/items/${itemId}`),
  create: (listId, data) => api.post(`/grocery_lists/${listId}/items`, data),
  update: (listId, itemId, data) => api.put(`/grocery_lists/${listId}/items/${itemId}`, data),
  delete: (listId, itemId) => api.delete(`/grocery_lists/${listId}/items/${itemId}`),
};

export default api; 