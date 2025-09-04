export interface Design {
  id: number;
  designName: string;
  category: string;
  subcategory: string;
  price: number;
  discountPrice?: number;
  availableColors: string[];
  imageUrls: string[];
  tags: string[];
  description?: string;
  fileSizePx?: string;
  fileSizeCm?: string;
  dpi?: number;
  includedFiles?: string;
  licenseType?: string;
  isPremium: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isDeleted: boolean;
  designedBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface PaginatedDesigns {
  content: Design[];
  pageable: {
    sort: {
      sorted: boolean;
      direction: string;
      orderBy: string[];
    };
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface ApiParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}