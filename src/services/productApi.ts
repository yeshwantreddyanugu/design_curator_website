import axios from 'axios';
import { Product, PaginatedProducts, ProductApiParams } from '@/types/product';

const API_BASE_URL = 'https://az.lytortech.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

export const productApi = {
  // Get all products with pagination
  getAllProducts: async (params: ProductApiParams = {}) => {
    const queryParams = new URLSearchParams();

    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/products?${queryParams}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    return response.json();
  },

  // Get latest products
  getLatestProducts: async (params: ProductApiParams = {}): Promise<PaginatedProducts> => {
    const response = await api.get('/products/latest', { params });
    return response.data;
  },

  // Get product by ID
  getProductById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    return response.json();
  },

  // Get products by type (CLOTHES or SHOES)
  getProductsByType: async (productType: string, params: ProductApiParams = {}): Promise<PaginatedProducts> => {
    const response = await api.get(`/products/type/${encodeURIComponent(productType)}`, { params });
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (category: string, params: ProductApiParams = {}): Promise<PaginatedProducts> => {
    const response = await api.get(`/products/category/${encodeURIComponent(category)}`, { params });
    return response.data;
  },

  // Get products by subcategory
  getProductsBySubcategory: async (subcategory: string, params: ProductApiParams = {}): Promise<PaginatedProducts> => {
    const response = await api.get(`/products/subcategory/${encodeURIComponent(subcategory)}`, { params });
    return response.data;
  },

  // Search products
  searchProducts: async (searchTerm: string, params: ProductApiParams = {}): Promise<PaginatedProducts> => {
    const response = await api.get('/products/search', {
      params: { searchTerm, ...params }
    });
    return response.data;
  },

  // Get products with filters
  getProductsWithFilters: async (filters: {
    productType?: string;
    category?: string;
    subcategory?: string;
    search?: string;
  }, params: ProductApiParams = {}): Promise<PaginatedProducts> => {
    const response = await api.get('/products/filter', {
      params: { ...filters, ...params }
    });
    return response.data;
  },

  // Get products by color
  getProductsByColor: async (color: string, params: ProductApiParams = {}): Promise<PaginatedProducts> => {
    const response = await api.get(`/products/color/${encodeURIComponent(color)}`, { params });
    return response.data;
  },

  // Get products by size
  getProductsBySize: async (size: string, params: ProductApiParams = {}): Promise<PaginatedProducts> => {
    const response = await api.get(`/products/size/${encodeURIComponent(size)}`, { params });
    return response.data;
  },

  // Get discounted products
  getDiscountedProducts: async (params: ProductApiParams = {}): Promise<PaginatedProducts> => {
    const response = await api.get('/products/discounted', { params });
    return response.data;
  },

  // Get products by price range
  getProductsByPriceRange: async (minPrice: number, maxPrice: number, params: ProductApiParams = {}): Promise<PaginatedProducts> => {
    const response = await api.get('/products/price-range', {
      params: { minPrice, maxPrice, ...params }
    });
    return response.data;
  },
};

export default api;