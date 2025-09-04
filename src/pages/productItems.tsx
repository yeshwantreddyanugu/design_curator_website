import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Filter, Grid, List, SlidersHorizontal, Search, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface Product {
  id: number;
  productName: string;
  productType: string;
  category: string;
  subcategory: string;
  price: number;
  discountPrice?: number;
  availableColors: string[];
  availableSizes: string[];
  imageUrls: string[];
  description: string;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductsResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  pageable: {
    pageNumber: number;
  };
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL params
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const search = searchParams.get('search');
  const isPremium = searchParams.get('premium') === 'true';
  const isTrending = searchParams.get('trending') === 'true';
  const isNewArrival = searchParams.get('new') === 'true';

  // Local state
  const [searchTerm, setSearchTerm] = useState(search || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // API state
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all products from API
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = 'https://az.lytortech.com';
      const endpoint = '/api/products/all';

      // Build query parameters
      const params = new URLSearchParams();
      params.append('size', '100'); // Get more products for frontend filtering

      const url = `${baseUrl}${endpoint}?${params.toString()}`;
      console.log('🌐 API URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ProductsResponse = await response.json();
      console.log('✅ API Response:', result);
      console.log('📊 Products count:', result.content?.length || 0);

      setAllProducts(result.content || []);
      setFilteredProducts(result.content || []);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
      console.log('🏁 Fetch completed');
    }
  };

  // Effect to fetch products on initial load
  useEffect(() => {
    console.log('🔄 Initial fetch triggered');
    fetchProducts();
  }, []);

  // Effect to filter products based on criteria
  useEffect(() => {
    console.log('🔍 Applying filters to products');
    
    let filtered = [...allProducts];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(product => 
        product.productName.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.subcategory.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter
    if (category) {
      filtered = filtered.filter(product => product.category === category);
    }
    
    // Apply subcategory filter
    if (subcategory) {
      filtered = filtered.filter(product => product.subcategory === subcategory);
    }
    
    // Apply color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product => 
        product.availableColors.some(color => selectedColors.includes(color))
      );
    }
    
    // Apply size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product => 
        product.availableSizes.some(size => selectedSizes.includes(size))
      );
    }
    
    // Apply premium filter
    if (isPremium) {
      // Assuming premium products have a higher price threshold
      filtered = filtered.filter(product => product.price > 50);
    }
    
    // Apply trending filter
    if (isTrending) {
      // Assuming trending products are those created recently
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(product => 
        new Date(product.createdAt) > oneWeekAgo
      );
    }
    
    // Apply new arrival filter
    if (isNewArrival) {
      // Assuming new arrivals are those created very recently
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      filtered = filtered.filter(product => 
        new Date(product.createdAt) > threeDaysAgo
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'productName':
          aValue = a.productName;
          bValue = b.productName;
          break;
        case 'price':
          aValue = a.discountPrice || a.price;
          bValue = b.discountPrice || b.price;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    console.log('✅ Filtered products count:', filtered.length);
    setFilteredProducts(filtered);
  }, [allProducts, search, category, subcategory, selectedColors, selectedSizes, isPremium, isTrending, isNewArrival, sortBy, sortDirection]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 Search submitted:', searchTerm);
    if (searchTerm.trim()) {
      setSearchParams({ search: searchTerm.trim() });
    } else {
      setSearchParams({});
    }
  };

  // Handle filter changes
  const updateFilters = (newFilters: Record<string, string | undefined>) => {
    console.log('🔧 Updating filters:', newFilters);
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params);
  };

  // Clear all filters
  const clearFilters = () => {
    console.log('🧹 Clearing all filters');
    setSearchParams({});
    setSearchTerm('');
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  // Get active filters for display
  const getActiveFilters = () => {
    const filters = [];
    if (category) filters.push({ label: `Category: ${category}`, key: 'category' });
    if (subcategory) filters.push({ label: `Subcategory: ${subcategory}`, key: 'subcategory' });
    if (isPremium) filters.push({ label: 'Premium', key: 'premium' });
    if (isTrending) filters.push({ label: 'Trending', key: 'trending' });
    if (isNewArrival) filters.push({ label: 'New Arrivals', key: 'new' });
    if (search) filters.push({ label: `Search: ${search}`, key: 'search' });
    return filters;
  };

  // Remove specific filter
  const removeFilter = (key: string) => {
    console.log('🗑️ Removing filter:', key);
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    setSearchParams(params);
    if (key === 'search') setSearchTerm('');
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Sort By</h3>
        <Select value={`${sortBy}-${sortDirection}`} onValueChange={(value) => {
          const [newSortBy, newDirection] = value.split('-');
          console.log('📊 Sort changed:', { sortBy: newSortBy, direction: newDirection });
          setSortBy(newSortBy);
          setSortDirection(newDirection as 'asc' | 'desc');
        }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            <SelectItem value="productName-asc">Name A-Z</SelectItem>
            <SelectItem value="productName-desc">Name Z-A</SelectItem>
            <SelectItem value="price-asc">Price Low to High</SelectItem>
            <SelectItem value="price-desc">Price High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Quick Filters</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="premium"
              checked={isPremium}
              onCheckedChange={(checked) =>
                updateFilters({ premium: checked ? 'true' : undefined })
              }
            />
            <label htmlFor="premium" className="text-sm">Premium Products</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="trending"
              checked={isTrending}
              onCheckedChange={(checked) =>
                updateFilters({ trending: checked ? 'true' : undefined })
              }
            />
            <label htmlFor="trending" className="text-sm">Trending</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="new"
              checked={isNewArrival}
              onCheckedChange={(checked) =>
                updateFilters({ new: checked ? 'true' : undefined })
              }
            />
            <label htmlFor="new" className="text-sm">New Arrivals</label>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Colors</h3>
        <div className="grid grid-cols-4 gap-2">
          {['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Black', 'White', 'Gray', 'Brown', 'Navy'].map((color) => (
            <button
              key={color}
              className={`h-8 w-8 rounded-full border-2 transition-smooth ${selectedColors.includes(color)
                  ? 'border-primary scale-110'
                  : 'border-muted hover:border-primary/50'
                }`}
              style={{ backgroundColor: color.toLowerCase() === 'white' ? '#ffffff' : color.toLowerCase() }}
              onClick={() => {
                const newColors = selectedColors.includes(color)
                  ? selectedColors.filter(c => c !== color)
                  : [...selectedColors, color];
                console.log('🎨 Color filter changed:', newColors);
                setSelectedColors(newColors);
              }}
              title={color}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Sizes</h3>
        <div className="flex flex-wrap gap-2">
          {['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'].map((size) => (
            <button
              key={size}
              className={`px-3 py-1 text-sm border rounded transition-smooth ${selectedSizes.includes(size)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted hover:border-primary/50'
                }`}
              onClick={() => {
                const newSizes = selectedSizes.includes(size)
                  ? selectedSizes.filter(s => s !== size)
                  : [...selectedSizes, size];
                console.log('📏 Size filter changed:', newSizes);
                setSelectedSizes(newSizes);
              }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const ProductCard = ({ product }: { product: Product }) => {
    console.log('🃏 Rendering product card:', product.productName);

    return (
      <Card
        className="group pattern-hover border-0 shadow-soft bg-card cursor-pointer"
        onClick={() => {
          console.log('👆 Product clicked:', product.id);
          navigate(`/product/${product.id}`);
        }}
      >
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={product.imageUrls?.[0] || '/placeholder.svg'}
              alt={product.productName}
              className={`w-full object-cover transition-smooth group-hover:scale-110 ${viewMode === 'grid' ? 'h-64' : 'h-32'
                }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />

            {/* Product Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.discountPrice && (
                <Badge className="bg-red-500 text-white">
                  {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                </Badge>
              )}
              {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                <Badge className="bg-orange-500 text-white">
                  Low Stock
                </Badge>
              )}
              {product.stockQuantity === 0 && (
                <Badge className="bg-gray-500 text-white">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-smooth">
              <Button
                size="sm"
                variant="ghost"
                className="text-white border-white/30 hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🛒 Add to cart clicked:', product.id);
                  // Add to cart functionality
                }}
                disabled={product.stockQuantity === 0}
              >
                {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
          </div>

          <div className={`p-4 ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
            <div className={viewMode === 'list' ? 'flex-1' : ''}>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-smooth">
                {product.productName}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {product.category} • {product.subcategory}
              </p>

              {/* Available Colors & Sizes */}
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>Colors: {product.availableColors.length}</span>
                <span>•</span>
                <span>Sizes: {product.availableSizes.join(', ')}</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mt-2">
                <span className="font-semibold text-primary">
                  ${product.discountPrice || product.price}
                </span>
                {product.discountPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.price}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mt-1">
                {product.stockQuantity === 0 ? (
                  <span className="text-xs text-red-500">Out of Stock</span>
                ) : product.stockQuantity <= 5 ? (
                  <span className="text-xs text-orange-500">
                    Only {product.stockQuantity} left
                  </span>
                ) : (
                  <span className="text-xs text-green-500">In Stock ({product.stockQuantity})</span>
                )}
              </div>
            </div>

            {viewMode === 'list' && (
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('🛒 Add to cart clicked (list view):', product.id);
                  }}
                  disabled={product.stockQuantity === 0}
                >
                  {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  console.log('🔄 Component render - Current state:', {
    isLoading,
    error,
    allProductsCount: allProducts.length,
    filteredProductsCount: filteredProducts.length
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">
            Product Collection
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/50 border-border focus:border-primary"
            />
          </form>

          {/* Active Filters */}
          {getActiveFilters().length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {getActiveFilters().map((filter) => (
                <Badge
                  key={filter.key}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {filter.label}
                  <button
                    onClick={() => removeFilter(filter.key)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Filters</h2>
                  <Filter className="h-4 w-4 text-muted-foreground" />
                </div>
                <FilterPanel />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterPanel />
                    </div>
                  </SheetContent>
                </Sheet>

                {!isLoading && (
                  <span className="text-sm text-muted-foreground">
                    {filteredProducts.length} products found
                  </span>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-0">
                      <div className="h-64 bg-muted rounded-lg" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">Error loading products:</p>
                <p className="text-red-500 text-sm mb-4">{error}</p>
                <Button onClick={fetchProducts} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {/* Products Grid/List */}
            {!isLoading && !error && (
              <>
                <div className={
                  viewMode === 'grid'
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Empty State */}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;