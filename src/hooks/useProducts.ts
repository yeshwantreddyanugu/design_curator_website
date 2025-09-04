import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/services/productApi';
import { ProductApiParams } from '@/types/product';

export const useProducts = (params: ProductApiParams = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.getAllProducts(params),
  });
};

export const useLatestProducts = (params: ProductApiParams = {}) => {
  return useQuery({
    queryKey: ['products', 'latest', params],
    queryFn: () => productApi.getLatestProducts(params),
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productApi.getProductById(id),
    enabled: !!id,
  });
};

export const useProductsByType = (productType: string, params: ProductApiParams = {}) => {
  return useQuery({
    queryKey: ['products', 'type', productType, params],
    queryFn: () => productApi.getProductsByType(productType, params),
    enabled: !!productType,
  });
};

export const useProductsByCategory = (category: string, params: ProductApiParams = {}) => {
  return useQuery({
    queryKey: ['products', 'category', category, params],
    queryFn: () => productApi.getProductsByCategory(category, params),
    enabled: !!category,
  });
};

export const useProductsBySubcategory = (subcategory: string, params: ProductApiParams = {}) => {
  return useQuery({
    queryKey: ['products', 'subcategory', subcategory, params],
    queryFn: () => productApi.getProductsBySubcategory(subcategory, params),
    enabled: !!subcategory,
  });
};

export const useSearchProducts = (searchTerm: string, params: ProductApiParams = {}) => {
  return useQuery({
    queryKey: ['products', 'search', searchTerm, params],
    queryFn: () => productApi.searchProducts(searchTerm, params),
    enabled: !!searchTerm,
  });
};

export const useProductsWithFilters = (filters: {
  productType?: string;
  category?: string;
  subcategory?: string;
  search?: string;
}, params: ProductApiParams = {}) => {
  return useQuery({
    queryKey: ['products', 'filters', filters, params],
    queryFn: () => productApi.getProductsWithFilters(filters, params),
  });
};

export const useProductsByColor = (color: string, params: ProductApiParams = {}) => {
  return useQuery({
    queryKey: ['products', 'color', color, params],
    queryFn: () => productApi.getProductsByColor(color, params),
    enabled: !!color,
  });
};

export const useProductsBySize = (size: string, params: ProductApiParams = {}) => {
  return useQuery({
    queryKey: ['products', 'size', size, params],
    queryFn: () => productApi.getProductsBySize(size, params),
    enabled: !!size,
  });
};

export const useDiscountedProducts = (params: ProductApiParams = {}) => {
  return useQuery({
    queryKey: ['products', 'discounted', params],
    queryFn: () => productApi.getDiscountedProducts(params),
  });
};

export const useProductsByPriceRange = (minPrice: number, maxPrice: number, params: ProductApiParams = {}) => {
  return useQuery({
    queryKey: ['products', 'price-range', minPrice, maxPrice, params],
    queryFn: () => productApi.getProductsByPriceRange(minPrice, maxPrice, params),
    enabled: typeof minPrice === 'number' && typeof maxPrice === 'number',
  });
};