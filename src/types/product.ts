export interface Product {
  id: number;
  productName: string;
  productType: string; // CLOTHES or SHOES
  category: string;
  subcategory: string;
  price: number;
  discountPrice?: number;
  availableColors: string[];
  availableSizes: string[];
  imageUrls: string[];
  description?: string;
  stockQuantity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProducts {
  content: Product[];
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

export interface ProductApiParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}