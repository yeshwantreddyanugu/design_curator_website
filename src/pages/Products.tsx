import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Filter, Grid, List, SlidersHorizontal, Search, X, ShoppingCart } from "lucide-react";
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
import { 
  useProducts, 
  useProductsByType,
  useProductsByCategory, 
  useProductsBySubcategory,
  useDiscountedProducts,
  useSearchProducts,
  useProductsWithFilters 
} from "@/hooks/useProducts";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // URL params
  const productType = searchParams.get('type');
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const search = searchParams.get('search');
  const isDiscounted = searchParams.get('discounted') === 'true';
  
  // Local state
  const [searchTerm, setSearchTerm] = useState(search || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  
  // API params
  const apiParams = {
    page,
    size: 20,
    sortBy,
    sortDirection
  };

  // Determine which hook to use based on filters
  let productsQuery;
  if (search) {
    productsQuery = useSearchProducts(search, apiParams);
  } else if (isDiscounted) {
    productsQuery = useDiscountedProducts(apiParams);
  } else if (productType || category || subcategory) {
    const filters = { productType, category, subcategory };
    productsQuery = useProductsWithFilters(filters, apiParams);
  } else {
    productsQuery = useProducts(apiParams);
  }

  const { data, isLoading, error } = productsQuery;

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ search: searchTerm.trim() });
      setPage(0);
    }
  };

  // Handle filter changes
  const updateFilters = (newFilters: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    setSearchParams(params);
    setPage(0);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({});
    setSearchTerm('');
    setPage(0);
  };

  // Get active filters for display
  const getActiveFilters = () => {
    const filters = [];
    if (productType) filters.push({ label: `Type: ${productType}`, key: 'type' });
    if (category) filters.push({ label: `Category: ${category}`, key: 'category' });
    if (subcategory) filters.push({ label: `Subcategory: ${subcategory}`, key: 'subcategory' });
    if (isDiscounted) filters.push({ label: 'On Sale', key: 'discounted' });
    if (search) filters.push({ label: `Search: ${search}`, key: 'search' });
    return filters;
  };

  // Remove specific filter
  const removeFilter = (key: string) => {
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
        <h3 className="font-semibold mb-3">Product Type</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="clothes" 
              checked={productType === 'CLOTHES'}
              onCheckedChange={(checked) => 
                updateFilters({ type: checked ? 'CLOTHES' : undefined })
              }
            />
            <label htmlFor="clothes" className="text-sm">Clothes</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="shoes" 
              checked={productType === 'SHOES'}
              onCheckedChange={(checked) => 
                updateFilters({ type: checked ? 'SHOES' : undefined })
              }
            />
            <label htmlFor="shoes" className="text-sm">Shoes</label>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Special Offers</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="discounted" 
              checked={isDiscounted}
              onCheckedChange={(checked) => 
                updateFilters({ discounted: checked ? 'true' : undefined })
              }
            />
            <label htmlFor="discounted" className="text-sm">On Sale</label>
          </div>
        </div>
      </div>
    </div>
  );

  const ProductCard = ({ product }: { product: any }) => (
    <Card 
      className="group pattern-hover border-0 shadow-soft bg-card cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={product.imageUrls?.[0] || '/placeholder.svg'}
            alt={product.productName}
            className={`w-full object-cover transition-smooth group-hover:scale-110 ${
              viewMode === 'grid' ? 'h-64' : 'h-32'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-smooth">
            <Button 
              variant="ghost"
              size="sm"
              className="text-white border-white/30 hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                // Add to cart logic here
              }}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
          {product.discountPrice && (
            <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
              Sale
            </Badge>
          )}
        </div>
        <div className={`p-4 ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
          <div className={viewMode === 'list' ? 'flex-1' : ''}>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-smooth">
              {product.productName}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {product.category} • {product.subcategory}
            </p>
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
            {product.stockQuantity && (
              <p className="text-xs text-muted-foreground mt-1">
                {product.stockQuantity} in stock
              </p>
            )}
          </div>
          {viewMode === 'list' && (
            <Button 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Add to cart logic here
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

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

                {data && (
                  <span className="text-sm text-muted-foreground">
                    {data.totalElements} products found
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Error loading products. Please try again.</p>
              </div>
            )}

            {/* Products Grid/List */}
            {data && data.content && (
              <>
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }>
                  {data.content.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {data.totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    <Button
                      variant="outline"
                      disabled={data.first || isLoading}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                      Page {data.pageable.pageNumber + 1} of {data.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={data.last || isLoading}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {data && data.content.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;