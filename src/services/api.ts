import axios from 'axios';
import { AstronomicalObject } from '@/utils/astronomyUtils';

const API_URL = import.meta.env.VITE_API_URL;
const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface QueryParams {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  minMagnitude?: number;
  maxMagnitude?: number;
  tags?: string[];
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  pages?: number;
}

export const astronomicalApi = {
  // Objects
  async getObjects(params: QueryParams): Promise<ApiResponse<AstronomicalObject[]>> {
    const response = await api.get('/objects', { params });
    return response.data;
  },

  async getObject(id: string): Promise<AstronomicalObject> {
    const response = await api.get(`/objects/${id}`);
    return response.data;
  },

  async createObject(object: Partial<AstronomicalObject>): Promise<AstronomicalObject> {
    const response = await api.post('/objects', object);
    return response.data;
  },

  async updateObject(id: string, object: Partial<AstronomicalObject>): Promise<AstronomicalObject> {
    const response = await api.put(`/objects/${id}`, object);
    return response.data;
  },

  async deleteObject(id: string): Promise<void> {
    await api.delete(`/objects/${id}`);
  },

  async getSimilarObjects(id: string): Promise<AstronomicalObject[]> {
    const response = await api.get(`/objects/${id}/similar`);
    return response.data;
  },

  // Observations
  async addObservation(objectId: string, observation: string): Promise<void> {
    await api.post(`/observations`, {
      objectId,
      note: observation,
      timestamp: new Date().toISOString(),
    });
  },

  async getObservations(objectId: string): Promise<any[]> {
    const response = await api.get(`/observations`, {
      params: { objectId },
    });
    return response.data;
  },

  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await api.post('/users/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return { token, user };
  },

  async register(email: string, password: string, name: string): Promise<{ token: string; user: any }> {
    const response = await api.post('/users/register', { email, password, name });
    const { token, user } = response.data;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return { token, user };
  },

  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  // User preferences and saved searches
  async getSavedSearches(): Promise<any[]> {
    const response = await api.get('/users/searches');
    return response.data;
  },

  async saveSearch(name: string, criteria: any): Promise<void> {
    await api.post('/users/searches', { name, criteria });
  },

  async deleteSavedSearch(id: string): Promise<void> {
    await api.delete(`/users/searches/${id}`);
  },
};

export default astronomicalApi;
