import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLatestProducts } from "@/hooks/useProducts";
import { ShoppingCart, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import patternGrid from "@/assets/pattern-grid.jpg";

const LatestProducts = () => {
  const { data: latestData, isLoading, error } = useLatestProducts({ size: 6 });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleQuickAdd = (product: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event from firing
    console.log("Add to cart clicked for product:", product);
    console.log("Current user authentication status:", !!user);

    if (!user) {
      console.log("User not authenticated, opening login modal");
      setIsAuthModalOpen(true);
      return;
    }

    console.log("User is authenticated, proceeding with cart addition");
    console.log("Adding product to cart with data:", {
      type: 'product',
      productId: product.id,
      title: product.title,
      price: product.finalPrice,
      discountPrice: product.discountPercentage,
      image: product.image,
      category: product.category,
      productType: product.productType,
      availableSizes: product.availableSizes,
      availableColors: product.availableColors,
      stockQuantity: product.stockQuantity,
    });
  };

  const handleViewProduct = (product: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event from firing
    console.log("View product clicked for:", product);

    if (product.id) {
      console.log("Navigating to product page:", `/product/${product.id}`);
      navigate(`/product/${product.id}`);
    } else {
      console.log("Product ID not available, showing error toast");
      toast({
        title: "Product unavailable",
        description: "This product is currently not available for detailed view.",
        variant: "destructive",
      });
    }
  };

  const handleCardClick = (product: any) => {
    console.log('👆 Product card clicked:', product.id);
    if (product.id) {
      navigate(`/product/${product.id}`);
    } else {
      toast({
        title: "Product unavailable",
        description: "This product is currently not available for detailed view.",
        variant: "destructive",
      });
    }
  };

  const handleAuthModalClose = () => {
    console.log("Auth modal closed");
    setIsAuthModalOpen(false);
  };

  const latestProducts = latestData?.content?.slice(0, 6).map((product) => {
    console.log("Processing product from API:", product);
    
    // Calculate final price based on discount
    const originalPrice = product.price;
    const discountPercentage = product.discountPrice || 0;
    const discountAmount = originalPrice * (discountPercentage / 100);
    const finalPrice = originalPrice - discountAmount;
    const hasDiscount = discountPercentage > 0;

    return {
      id: product.id,
      title: product.productName,
      category: product.category,
      productType: product.productType,
      originalPrice: originalPrice,
      finalPrice: Math.ceil(finalPrice), // Round up the final price
      discountPercentage: discountPercentage,
      hasDiscount: hasDiscount,
      image: product.imageUrls?.[0] || patternGrid,
      stockQuantity: product.stockQuantity,
      availableSizes: product.availableSizes || [],
      availableColors: product.availableColors || []
    };
  }) || [
      {
        title: "Tropical Print T-Shirts",
        category: "Apparel",
        productType: "CLOTHES",
        originalPrice: 29.99,
        finalPrice: 29.99,
        hasDiscount: false,
        image: patternGrid,
        stockQuantity: 15
      },
      {
        title: "Designer Sneakers",
        category: "Footwear",
        productType: "SHOES",
        originalPrice: 89.99,
        finalPrice: 89.99,
        hasDiscount: false,
        image: patternGrid,
        stockQuantity: 8
      },
      {
        title: "Pattern Dresses",
        category: "Womenswear",
        productType: "CLOTHES",
        originalPrice: 59.99,
        finalPrice: 59.99,
        hasDiscount: false,
        image: patternGrid,
        stockQuantity: 12
      },
      {
        title: "Casual Joggers",
        category: "Activewear",
        productType: "CLOTHES",
        originalPrice: 39.99,
        finalPrice: 39.99,
        hasDiscount: false,
        image: patternGrid,
        stockQuantity: 20
      },
      {
        title: "Print Accessories",
        category: "Accessories",
        productType: "CLOTHES",
        originalPrice: 19.99,
        finalPrice: 19.99,
        hasDiscount: false,
        image: patternGrid,
        stockQuantity: 25
      },
      {
        title: "Designer Jackets",
        category: "Outerwear",
        productType: "CLOTHES",
        originalPrice: 129.99,
        finalPrice: 129.99,
        hasDiscount: false,
        image: patternGrid,
        stockQuantity: 5
      }
    ];

  console.log("Latest products data:", latestProducts);
  console.log("Loading state:", isLoading);
  console.log("Error state:", error);

  if (error) {
    console.error('Error loading latest products:', error);
  }

  // In LatestProducts component, add better error handling:
  if (error) {
    console.error('Error loading latest products:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Failed to load products</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-0">
              <div className="h-56 bg-muted rounded-lg" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-6 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <section className="py-1 bg-background pb-6">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              Shop Latest Products
            </h2>
            <p className="text-muted-foreground text-lg">
              Discover the newest fashion items featuring our exclusive designs
            </p>
          </div>

          {isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading latest products...</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestProducts.map((product, index) => {
              console.log("Rendering product card:", product, "at index:", index);
              return (
                <Card 
                  key={index} 
                  className="group pattern-hover border-0 shadow-soft cursor-pointer"
                  onClick={() => handleCardClick(product)}
                >
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-56 object-contain bg-white transition-smooth group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Badge
                          className={`${product.productType === 'CLOTHES'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                            }`}
                        >
                          {product.productType}
                        </Badge>
                        {product.hasDiscount && (
                          <Badge className="bg-green-100 text-green-800">
                            {product.discountPercentage}% OFF
                          </Badge>
                        )}
                        {product.stockQuantity && product.stockQuantity < 10 && (
                          <Badge variant="destructive">
                            Low Stock
                          </Badge>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
                      <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-smooth opacity-0 group-hover:opacity-100">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {product.availableColors?.slice(0, 3).map((color, colorIndex) => (
                            <div
                              key={colorIndex}
                              className="w-4 h-4 rounded-full border border-white/30"
                              style={{ backgroundColor: color.toLowerCase() }}
                            />
                          ))}
                          {product.availableColors?.length > 3 && (
                            <span className="text-white/80 text-xs">+{product.availableColors.length - 3}</span>
                          )}
                        </div>
                        {product.availableSizes && (
                          <div className="flex flex-wrap gap-1">
                            {product.availableSizes.slice(0, 4).map((size, sizeIndex) => (
                              <Badge key={sizeIndex} variant="secondary" className="text-xs py-0">
                                {size}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {product.category}
                      </Badge>
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-smooth">
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <p className="text-primary font-semibold">
                            ₹{product.finalPrice}
                          </p>
                          {product.hasDiscount && (
                            <p className="text-muted-foreground text-sm line-through">
                              ₹{product.originalPrice}
                            </p>
                          )}
                        </div>
                        {product.stockQuantity && (
                          <span className="text-muted-foreground text-xs">
                            {product.stockQuantity} left
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/allProductItems')}
              className="text-primary hover:text-primary-muted font-semibold transition-smooth"
            >
              View All Products →
            </button>
          </div>
        </div>
      </section>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        title="Sign In to Continue"
        description="Please sign in to add items to your cart"
      />
    </>
  );
};

export default LatestProducts;