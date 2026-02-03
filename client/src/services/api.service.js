import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    // Server returns { status: 'success', data: { student, token } }
    return response.data.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    // Server returns { status: 'success', data: { student, token } }
    return response.data.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const aiService = {
  askQuestion: async (question, subjectId) => {
    const response = await api.post('/ai/ask', { question, subjectId });
    // Server returns { status: 'success', data: { response, questionId, ... } }
    return response.data.data || response.data;
  },

  getVoiceResponse: async (questionId) => {
    const response = await api.post('/ai/voice', { questionId });
    // Server returns { status: 'success', data: { audioUrl, format } }
    const data = response.data.data || response.data;
    
    // Convert base64 audio URL to blob
    if (data.audioUrl && data.audioUrl.startsWith('data:')) {
      const base64Data = data.audioUrl.split(',')[1];
      const mimeType = data.audioUrl.split(';')[0].split(':')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    }
    
    throw new Error('Invalid audio response');
  },
};

export const subjectService = {
  getAllSubjects: async () => {
    const response = await api.get('/subjects');
    // Handle both response formats: { data: { subjects } } or { subjects }
    return response.data.data || response.data;
  },
};

export const progressService = {
  getMyProgress: async () => {
    const response = await api.get('/progress');
    return response.data;
  },
};

export default api;
