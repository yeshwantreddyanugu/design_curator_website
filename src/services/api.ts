import axios from 'axios';
import { Design, PaginatedDesigns, ApiParams } from '@/types/design';

const API_BASE_URL = 'https://26dec8370623.ngrok-free.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
  },
});

export const designApi = {
  // Get all designs with pagination
  getAllDesigns: async (params: ApiParams = {}): Promise<PaginatedDesigns> => {
    const response = await api.get('/designs', { params });
    return response.data;
  },

  // Get design by ID
  getDesignById: async (id: number): Promise<Design> => {
    const response = await api.get(`/designs/${id}`);
    return response.data;
  },

  // Search designs
  searchDesigns: async (searchTerm: string, params: ApiParams = {}): Promise<PaginatedDesigns> => {
    const response = await api.get('/designs/search', {
      params: { searchTerm, ...params }
    });
    return response.data;
  },

  // Get designs by category
  getDesignsByCategory: async (category: string, params: ApiParams = {}): Promise<PaginatedDesigns> => {
    const response = await api.get(`/designs/category/${encodeURIComponent(category)}`, { params });
    return response.data;
  },

  // Get designs by subcategory
  getDesignsBySubcategory: async (subcategory: string, params: ApiParams = {}): Promise<PaginatedDesigns> => {
    const response = await api.get(`/designs/subcategory/${encodeURIComponent(subcategory)}`, { params });
    return response.data;
  },

  // Get trending designs
  getTrendingDesigns: async (params: ApiParams = {}): Promise<PaginatedDesigns> => {
    const response = await api.get('/designs/trending', { params });
    return response.data;
  },

  // Get new arrival designs
  getNewArrivalDesigns: async (params: ApiParams = {}): Promise<PaginatedDesigns> => {
    const response = await api.get('/designs/new-arrivals', { params });
    return response.data;
  },

  // Get premium designs
  getPremiumDesigns: async (params: ApiParams = {}): Promise<PaginatedDesigns> => {
    const response = await api.get('/designs/premium', { params });
    return response.data;
  },

  // Get designs by color
  getDesignsByColor: async (color: string, params: ApiParams = {}): Promise<PaginatedDesigns> => {
    const response = await api.get(`/designs/color/${encodeURIComponent(color)}`, { params });
    return response.data;
  },

  // Get designs by tag
  getDesignsByTag: async (tag: string, params: ApiParams = {}): Promise<PaginatedDesigns> => {
    const response = await api.get(`/designs/tag/${encodeURIComponent(tag)}`, { params });
    return response.data;
  },

  // Get designs with filters
  getDesignsWithFilters: async (filters: {
    category?: string;
    subcategory?: string;
    color?: string;
    isPremium?: boolean;
    isTrending?: boolean;
    isNewArrival?: boolean;
  }, params: ApiParams = {}): Promise<PaginatedDesigns> => {
    const response = await api.get('/designs/filter', {
      params: { ...filters, ...params }
    });
    return response.data;
  },

  // Download design file
  downloadDesign: async (id: number): Promise<Blob> => {
    const response = await api.get(`/designs/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

export default api;