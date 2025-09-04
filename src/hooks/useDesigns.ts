import { useQuery } from '@tanstack/react-query';
import { designApi } from '@/services/api';
import { ApiParams } from '@/types/design';

export const useDesigns = (params: ApiParams = {}) => {
  return useQuery({
    queryKey: ['designs', params],
    queryFn: () => designApi.getAllDesigns(params),
  });
};

export const useDesignsByCategory = (category: string, params: ApiParams = {}) => {
  return useQuery({
    queryKey: ['designs', 'category', category, params],
    queryFn: () => designApi.getDesignsByCategory(category, params),
    enabled: !!category,
  });
};

export const useDesignsBySubcategory = (subcategory: string, params: ApiParams = {}) => {
  return useQuery({
    queryKey: ['designs', 'subcategory', subcategory, params],
    queryFn: () => designApi.getDesignsBySubcategory(subcategory, params),
    enabled: !!subcategory,
  });
};

export const useTrendingDesigns = (params: ApiParams = {}) => {
  return useQuery({
    queryKey: ['designs', 'trending', params],
    queryFn: () => designApi.getTrendingDesigns(params),
  });
};

export const useNewArrivalDesigns = (params: ApiParams = {}) => {
  return useQuery({
    queryKey: ['designs', 'new-arrivals', params],
    queryFn: () => designApi.getNewArrivalDesigns(params),
  });
};

export const usePremiumDesigns = (params: ApiParams = {}) => {
  return useQuery({
    queryKey: ['designs', 'premium', params],
    queryFn: () => designApi.getPremiumDesigns(params),
  });
};

export const useSearchDesigns = (searchTerm: string, params: ApiParams = {}) => {
  return useQuery({
    queryKey: ['designs', 'search', searchTerm, params],
    queryFn: () => designApi.searchDesigns(searchTerm, params),
    enabled: !!searchTerm,
  });
};

export const useDesignsByColor = (color: string, params: ApiParams = {}) => {
  return useQuery({
    queryKey: ['designs', 'color', color, params],
    queryFn: () => designApi.getDesignsByColor(color, params),
    enabled: !!color,
  });
};

export const useDesignsByTag = (tag: string, params: ApiParams = {}) => {
  return useQuery({
    queryKey: ['designs', 'tag', tag, params],
    queryFn: () => designApi.getDesignsByTag(tag, params),
    enabled: !!tag,
  });
};

export const useDesignsWithFilters = (filters: {
  category?: string;
  subcategory?: string;
  color?: string;
  isPremium?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
}, params: ApiParams = {}) => {
  return useQuery({
    queryKey: ['designs', 'filters', filters, params],
    queryFn: () => designApi.getDesignsWithFilters(filters, params),
  });
};