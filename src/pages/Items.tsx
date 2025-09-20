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
import DownloadButton from "@/components/DownloadButton";
import {
  useDesigns,
  useDesignsByCategory,
  useDesignsBySubcategory,
  useTrendingDesigns,
  useNewArrivalDesigns,
  usePremiumDesigns,
  useSearchDesigns
} from "@/hooks/useDesigns";

const Items = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL params
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const search = searchParams.get('search');
  const isPremium = searchParams.get('premium') === 'true';
  const isTrending = searchParams.get('trending') === 'true';
  const isNewArrival = searchParams.get('new') === 'true';
  const colorsParam = searchParams.get('colors');

  // Local state
  const [searchTerm, setSearchTerm] = useState(search || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [selectedColors, setSelectedColors] = useState<string[]>(
    colorsParam ? colorsParam.split(',') : []
  );

  // Categories data
  const categories = [
    'Geometric',
    'Floral',
    'Animals/Birds',
    'World',
    'Conversationals',
    'Abstract',
    'Checks',
    'Stripes',
    'Paisleys',
    'Tropical',
    'Traditional',
    'Placements',
    'Texture',
    'Camouflage',
    'Animal Skins',
    'Nature',
    'Border',
    '2 & 3 Colour'
  ];

  // Update selectedColors when URL changes
  useEffect(() => {
    setSelectedColors(colorsParam ? colorsParam.split(',') : []);
  }, [colorsParam]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [subcategory, search, isPremium, isTrending, isNewArrival, colorsParam, sortBy, sortDirection]);

  // API params - don't include colors in API query, we'll filter client-side
  const apiParams = {
    page,
    size: 20,
    sortBy,
    sortDirection
  };

  // Determine which hook to use based on filters
  let designsQuery;
  if (search) {
    designsQuery = useSearchDesigns(search, apiParams);
  } else if (isPremium) {
    designsQuery = usePremiumDesigns(apiParams);
  } else if (isTrending) {
    designsQuery = useTrendingDesigns(apiParams);
  } else if (isNewArrival) {
    designsQuery = useNewArrivalDesigns(apiParams);
  } else {
    // Always use useDesigns for subcategory filtering since we're doing client-side filtering
    designsQuery = useDesigns(apiParams);
  }

  const { data: rawData, isLoading, error } = designsQuery;

  // Filter data client-side for colors and subcategory matching
  const data = rawData ? {
    ...rawData,
    content: rawData.content.filter((design: any) => {
      // Color filtering
      let passesColorFilter = true;
      if (selectedColors.length > 0) {
        if (design.availableColors && Array.isArray(design.availableColors)) {
          passesColorFilter = design.availableColors.some((color: string) =>
            selectedColors.includes(color)
          );
        } else {
          passesColorFilter = false;
        }
      }

      // Subcategory filtering - check if selected subcategory matches any word in category or subcategory
      let passesSubcategoryFilter = true;
      if (subcategory && subcategory !== 'all') {
        const designCategory = (design.category || '').toLowerCase();
        const designSubcategory = (design.subcategory || '').toLowerCase();
        const selectedSubcategoryLower = subcategory.toLowerCase();
        
        // Check if the selected subcategory matches any word in category or subcategory
        const categoryWords = designCategory.split(/[\s,]+/).filter(word => word.length > 0);
        const subcategoryWords = designSubcategory.split(/[\s,]+/).filter(word => word.length > 0);
        const allWords = [...categoryWords, ...subcategoryWords];
        
        passesSubcategoryFilter = allWords.some(word => 
          word.includes(selectedSubcategoryLower) || 
          selectedSubcategoryLower.includes(word)
        );
      }

      return passesColorFilter && passesSubcategoryFilter;
    })
  } : rawData;

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const params = new URLSearchParams(searchParams);
      params.set('search', searchTerm.trim());
      // Remove other conflicting filters when searching
      params.delete('category');
      params.delete('subcategory');
      params.delete('premium');
      params.delete('trending');
      params.delete('new');
      setSearchParams(params);
    }
  };

  // Handle filter changes
  const updateFilters = (newFilters: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params);
  };

  // Handle category selection
  const handleCategoryChange = (selectedCategory: string) => {
    if (selectedCategory === 'all') {
      updateFilters({ 
        subcategory: undefined
      });
    } else {
      // Set as subcategory filter for backend compatibility
      updateFilters({ 
        subcategory: selectedCategory,
        search: undefined,
        premium: undefined,
        trending: undefined,
        new: undefined
      });
    }
  };

  // Handle color filter changes
  const handleColorChange = (color: string, checked: boolean) => {
    let newColors: string[];
    if (checked) {
      newColors = [...selectedColors, color];
    } else {
      newColors = selectedColors.filter(c => c !== color);
    }

    setSelectedColors(newColors);
    updateFilters({
      colors: newColors.length > 0 ? newColors.join(',') : undefined
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({});
    setSearchTerm('');
    setSelectedColors([]);
    setPage(0);
  };

  // Get active filters for display
  const getActiveFilters = () => {
    const filters = [];
    if (subcategory) filters.push({ label: `Category: ${subcategory}`, key: 'subcategory' });
    if (isPremium) filters.push({ label: 'Premium', key: 'premium' });
    if (isTrending) filters.push({ label: 'Trending', key: 'trending' });
    if (isNewArrival) filters.push({ label: 'New Arrivals', key: 'new' });
    if (search) filters.push({ label: `Search: ${search}`, key: 'search' });
    if (selectedColors.length > 0) {
      filters.push({ label: `Colors: ${selectedColors.join(', ')}`, key: 'colors' });
    }
    return filters;
  };

  // Remove specific filter
  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    setSearchParams(params);
    if (key === 'search') setSearchTerm('');
    if (key === 'colors') setSelectedColors([]);
  };

  // Available colors based on your data structure
  const availableColors = [
    'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange',
    'Pink', 'Black', 'White', 'Gray', 'Brown', 'Navy'
  ];

  // Color mapping for better visual representation
  const getColorStyle = (color: string) => {
    const colorMap: Record<string, string> = {
      'Red': '#ef4444',
      'Blue': '#3b82f6',
      'Green': '#22c55e',
      'Yellow': '#eab308',
      'Purple': '#a855f7',
      'Orange': '#f97316',
      'Pink': '#ec4899',
      'Black': '#000000',
      'White': '#ffffff',
      'Gray': '#6b7280',
      'Brown': '#a3530a',
      'Navy': '#1e3a8a'
    };
    return colorMap[color] || color.toLowerCase();
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
            <SelectItem value="designName-asc">Name A-Z</SelectItem>
            <SelectItem value="designName-desc">Name Z-A</SelectItem>
            <SelectItem value="price-asc">Price Low to High</SelectItem>
            <SelectItem value="price-desc">Price High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <Select 
          value={subcategory || 'all'} 
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
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
            <label htmlFor="premium" className="text-sm cursor-pointer">Premium Designs</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="trending"
              checked={isTrending}
              onCheckedChange={(checked) =>
                updateFilters({ trending: checked ? 'true' : undefined })
              }
            />
            <label htmlFor="trending" className="text-sm cursor-pointer">Trending</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="new"
              checked={isNewArrival}
              onCheckedChange={(checked) =>
                updateFilters({ new: checked ? 'true' : undefined })
              }
            />
            <label htmlFor="new" className="text-sm cursor-pointer">New Arrivals</label>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Colors</h3>
        <div className="grid grid-cols-4 gap-2">
          {availableColors.map((color) => (
            <button
              key={color}
              className={`h-8 w-8 rounded-full border-2 transition-all duration-200 hover:scale-105 ${selectedColors.includes(color)
                ? 'border-primary ring-2 ring-primary/20 scale-110'
                : 'border-gray-300 hover:border-primary/50'
                } ${color === 'White' ? 'shadow-md' : ''}`}
              style={{ backgroundColor: getColorStyle(color) }}
              onClick={() => handleColorChange(color, !selectedColors.includes(color))}
              title={color}
              aria-label={`Filter by ${color} color`}
            >
              {selectedColors.includes(color) && (
                <div className="w-full h-full rounded-full flex items-center justify-center">
                  <div className={`w-2 h-2 rounded-full ${color === 'White' || color === 'Yellow' ? 'bg-gray-600' : 'bg-white'
                    }`} />
                </div>
              )}
            </button>
          ))}
        </div>
        {selectedColors.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedColors([]);
              updateFilters({ colors: undefined });
            }}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear colors
          </Button>
        )}
      </div>
    </div>
  );

  const DesignCard = ({ design }: { design: any }) => (
    <Card
      className="group pattern-hover border-0 shadow-soft bg-card cursor-pointer transition-all duration-300 hover:shadow-lg"
      onClick={() => navigate(`/design/${design.id}`)}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={design.imageUrls?.[0] || '/placeholder.svg'}
            alt={design.designName}
            className={`w-full object-cover transition-all duration-300 group-hover:scale-110 ${viewMode === 'grid' ? 'h-64' : 'h-32'
              }`}
          />
        </div>

        <div className={`p-4 ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
          <div className={viewMode === 'list' ? 'flex-1' : ''}>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {design.designName}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {design.category} {design.subcategory && design.subcategory !== 'n' && `• ${design.subcategory}`}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="font-semibold text-primary">
                ₹{design.discountPrice > 0 ? Math.round(design.price - (design.price * design.discountPrice / 100)) : Math.round(design.price)}
              </span>
              {design.discountPrice > 0 && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{Math.round(design.price)}
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-md">
                    {design.discountPrice}% OFF
                  </span>
                </>
              )}
            </div>

            {/* File specifications */}
            <div className="flex items-start justify-start gap-1 mt-2 text-xs font-medium text-muted-foreground">
              <span>{design.fileSizePx}px</span>
              <span>/</span>
              <span>{design.fileSizeCm}cm</span>
              <span>/</span>
              <span>{design.dpi}dpi</span>
            </div>

            {/* Tags */}
            {/* {design.tags && design.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {design.tags.slice(0, 2).map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )} */}
          </div>

          {viewMode === 'list' && (
            <DownloadButton
              designId={design.id}
              designName={design.designName}
              size="sm"
              onClick={(e) => e.stopPropagation()}
            />
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
            Design Collection
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search designs..."
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
                  className="flex items-center gap-1 cursor-pointer hover:bg-destructive/10"
                  onClick={() => removeFilter(filter.key)}
                >
                  {filter.label}
                  <X className="h-3 w-3" />
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
                      {getActiveFilters().length > 0 && (
                        <Badge className="ml-2 px-1 py-0 text-xs">
                          {getActiveFilters().length}
                        </Badge>
                      )}
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
                    {selectedColors.length > 0 && data.content.length !== rawData?.totalElements
                      ? `${data.content.length} of ${rawData?.totalElements} designs found`
                      : `${rawData?.totalElements || data.content.length} designs found`
                    }
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
              <div className={
                viewMode === 'grid'
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-0">
                      <div className={`bg-muted rounded-t-lg ${viewMode === 'grid' ? 'h-64' : 'h-32'}`} />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Error loading designs. Please try again.</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            )}

            {/* Designs Grid/List */}
            {data && data.content && (
              <>
                <div className={
                  viewMode === 'grid'
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }>
                  {data.content.map((design) => (
                    <DesignCard key={design.id} design={design} />
                  ))}
                </div>

                {/* Pagination - only show if we have original pagination or if we're filtering colors */}
                {((rawData?.totalPages > 1) || (selectedColors.length > 0 && data.content.length > 20)) && (
                  <div className="flex justify-center items-center mt-8 gap-2">
                    <Button
                      variant="outline"
                      disabled={rawData?.first || isLoading}
                      onClick={() => setPage(Math.max(0, page - 1))}
                    >
                      Previous
                    </Button>

                    {/* Page info */}
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                      Page {(rawData?.pageable?.pageNumber || 0) + 1} of {rawData?.totalPages || 1}
                    </span>

                    <Button
                      variant="outline"
                      disabled={rawData?.last || isLoading}
                      onClick={() => setPage(Math.min((rawData?.totalPages || 1) - 1, page + 1))}
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
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No designs found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
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

export default Items;