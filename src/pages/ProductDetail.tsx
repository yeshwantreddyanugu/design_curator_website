import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Package, Palette, Minus, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageModal from "@/components/ImageModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

interface Product {
  id: number;
  productName: string;
  productType: string;
  category: string;
  subcategory: string;
  price: number;
  discountPrice?: number; // This is now the discount percentage
  availableColors: string[];
  availableSizes: string[];
  imageUrls: string[];
  description: string;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Product;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Parse product ID and validate
  const productId = id ? parseInt(id, 10) : null;

  // Local state
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [orderInitiated, setOrderInitiated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Product data state
  const [productData, setProductData] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Price calculation function
  const calculateFinalPrice = (originalPrice: number, discountPercentage?: number): number => {
    if (!discountPercentage || discountPercentage <= 0) {
      return originalPrice;
    }
    const discountAmount = originalPrice * (discountPercentage / 100);
    const finalPrice = originalPrice - discountAmount;
    return Math.ceil(finalPrice);
  };

  // Get final price for display and calculations
  const getFinalPrice = () => {
    if (!productData) return 0;
    return calculateFinalPrice(productData.price, productData.discountPrice);
  };

  // Debug logs
  console.log("🔄 ProductDetail Component Render:", {
    productId,
    productData,
    isLoading,
    error,
    selectedColor,
    selectedSize,
    quantity,
    orderInitiated,
    finalPrice: getFinalPrice()
  });

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("No product ID provided");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("🌐 Fetching product data for ID:", productId);
        const response = await fetch(`https://az.lytortech.com/api/admin/products/${productId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
        });

        console.log("📡 API Response Status:", response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ API Error Response:", errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result: ApiResponse = await response.json();
        console.log("✅ Product Data Received:", result);

        if (result.success && result.data) {
          setProductData(result.data);
          console.log("💰 Price Calculation:", {
            originalPrice: result.data.price,
            discountPercentage: result.data.discountPrice,
            finalPrice: calculateFinalPrice(result.data.price, result.data.discountPrice)
          });
        } else {
          throw new Error(result.message || 'Failed to fetch product data');
        }

      } catch (err) {
        console.error("💥 Fetch Error:", err);
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
        toast({
          title: "Error loading product",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, toast]);

  // Auto-select first available options
  useEffect(() => {
    if (productData) {
      console.log("🎯 Auto-selecting options for product:", productData.productName);

      if (!selectedColor && productData.availableColors?.length > 0) {
        const firstColor = productData.availableColors[0];
        console.log("🎨 Auto-selecting color:", firstColor);
        setSelectedColor(firstColor);
      }

      if (!selectedSize && productData.availableSizes?.length > 0) {
        const firstSize = productData.availableSizes[0];
        console.log("📏 Auto-selecting size:", firstSize);
        setSelectedSize(firstSize);
      }
    }
  }, [productData, selectedColor, selectedSize]);

  // Handle quantity changes
  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(quantity + delta, productData?.stockQuantity || 1));
    console.log("🔢 Quantity change:", { old: quantity, new: newQuantity, delta });
    setQuantity(newQuantity);
  };

  // Handle image click
  const handleImageClick = (index: number) => {
    console.log(`Image clicked: index ${index}`);
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  // Handle image modal close
  const handleImageModalClose = () => {
    console.log("Image modal closed");
    setIsModalOpen(false);
  };

  // Handle buy now
  const handleBuyNow = () => {
    console.log("🛒 Buy now clicked", {
      product: productData,
      selectedColor,
      selectedSize,
      quantity,
      user,
      orderInitiated
    });

    if (!productData) {
      toast({
        title: "Product not found",
        description: "Unable to proceed with purchase.",
        variant: "destructive",
      });
      return;
    }

    // Check authentication
    if (!user) {
      console.log("🔐 User not authenticated, showing login modal");
      setIsAuthModalOpen(true);
      return;
    }

    // Validate selections
    if (productData.availableColors?.length > 0 && !selectedColor) {
      toast({
        title: "Please select a color",
        description: "You need to choose a color before purchasing.",
        variant: "destructive",
      });
      return;
    }

    if (productData.availableSizes?.length > 0 && !selectedSize) {
      toast({
        title: "Please select a size",
        description: "You need to choose a size before purchasing.",
        variant: "destructive",
      });
      return;
    }

    // Check stock availability
    if (productData.stockQuantity < quantity) {
      toast({
        title: "Insufficient stock",
        description: `Only ${productData.stockQuantity} items available.`,
        variant: "destructive",
      });
      return;
    }

    // Calculate final price using the new logic
    const finalPrice = getFinalPrice();
    const totalAmount = finalPrice * quantity;

    // Prepare enhanced purchase data with all product details
    const purchaseData = {
      productId: productData.id,
      productName: productData.productName,
      price: finalPrice, // Use calculated final price
      quantity: quantity,
      selectedColor: selectedColor,
      selectedSize: selectedSize,
      totalAmount: totalAmount,
      productImage: productData.imageUrls?.[0] || '',
      productType: productData.productType,
      category: productData.category,
      subcategory: productData.subcategory,
      description: productData.description,
      originalPrice: productData.price,
      discountPercentage: productData.discountPrice, // Now stores discount percentage
      finalPrice: finalPrice // Add final calculated price
    };

    try {
      console.log("➡️ Proceeding to product payment with:", purchaseData);

      toast({
        title: "Proceeding to payment",
        description: `${productData.productName} (${quantity}) - Total: ₹${totalAmount.toFixed(2)}`,
      });

      // Set order initiated state
      setOrderInitiated(true);

      // Navigate to productPayment page
      navigate('/productPayment', { state: { purchaseData } });

    } catch (error) {
      console.error("❌ Error processing purchase:", error);
      toast({
        title: "Error",
        description: "Failed to process purchase. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAuthModalClose = () => {
    console.log("Auth modal closed");
    setIsAuthModalOpen(false);
  };

  // Loading state
  if (isLoading) {
    console.log("⏳ Showing loading state");
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !productData || !productId) {
    console.error("❌ ProductDetail Error:", { error, product: productData, productId });

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Product not found</h1>
            <p className="text-muted-foreground">The product you're looking for doesn't exist or has been removed.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isOutOfStock = productData.stockQuantity === 0;
  const isLowStock = productData.stockQuantity > 0 && productData.stockQuantity <= 5;
  const finalPrice = getFinalPrice();
  const hasDiscount = productData.discountPrice && productData.discountPrice > 0;

  console.log("🎨 Rendering product details:", {
    productName: productData.productName,
    originalPrice: productData.price,
    discountPercentage: productData.discountPrice,
    finalPrice: finalPrice,
    hasDiscount: hasDiscount,
    isOutOfStock,
    isLowStock,
    selectedColor,
    selectedSize,
    orderInitiated
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            <div 
              className="aspect-square overflow-hidden rounded-lg border cursor-pointer select-none"
              onClick={() => handleImageClick(0)}
              onContextMenu={(e) => { e.preventDefault(); return false; }}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            >
              <img
                src={productData.imageUrls?.[0] || '/placeholder.svg'}
                alt={productData.productName}
                className="w-full h-full object-cover hover:scale-105 transition-smooth select-none"
                onContextMenu={(e) => { e.preventDefault(); return false; }}
                onDragStart={(e) => { e.preventDefault(); return false; }}
                draggable={false}
                style={{ 
                  userSelect: 'none', 
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none'
                } as React.CSSProperties}
              />
            </div>
            
            {/* Additional Images */}
            {productData.imageUrls && productData.imageUrls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productData.imageUrls.slice(1, 5).map((url, index) => (
                  <div 
                    key={index} 
                    className="aspect-square overflow-hidden rounded-lg border cursor-pointer select-none"
                    onClick={() => handleImageClick(index + 1)}
                    onContextMenu={(e) => { e.preventDefault(); return false; }}
                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                  >
                    <img
                      src={url}
                      alt={`${productData.productName} ${index + 2}`}
                      className="w-full h-full object-cover hover:scale-110 transition-smooth select-none"
                      onContextMenu={(e) => { e.preventDefault(); return false; }}
                      onDragStart={(e) => { e.preventDefault(); return false; }}
                      draggable={false}
                      style={{ 
                        userSelect: 'none', 
                        WebkitUserSelect: 'none',
                        WebkitTouchCallout: 'none'
                      } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {hasDiscount && (
                  <Badge className="bg-red-500 text-white">
                    {productData.discountPrice}% OFF
                  </Badge>
                )}
                {isLowStock && !isOutOfStock && (
                  <Badge variant="secondary">Low Stock</Badge>
                )}
              </div>
              
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                {productData.productName}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>{productData.category}</span>
                <span>•</span>
                <span>{productData.subcategory}</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl font-bold text-primary">
                  ₹{finalPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{productData.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      Save ₹{(productData.price - finalPrice).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Quantity Selection */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Quantity</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 font-medium min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (productData.stockQuantity || 1)}
                      className="p-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {productData.stockQuantity} available
                  </span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                {isOutOfStock ? 'Out of Stock' : `Buy Now - ₹${(finalPrice * quantity).toFixed(2)}`}
              </Button>
            </div>

            <Separator />

            {/* Description */}
            {productData.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{productData.description}</p>
              </div>
            )}

            {/* Product Specifications */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Product Specifications
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium">{productData.productType}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium">{productData.category}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Subcategory:</span>
                    <p className="font-medium">{productData.subcategory}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Stock:</span>
                    <p className={`font-medium ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-500' : 'text-green-500'}`}>
                      {isOutOfStock ? 'Out of stock' : `${productData.stockQuantity} available`}
                    </p>
                  </div>
                  
                  {hasDiscount && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Original Price:</span>
                        <p className="font-medium">${productData.price.toFixed(2)}</p>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Discount:</span>
                        <p className="font-medium text-green-600">{productData.discountPrice}% OFF</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Available Colors */}
            {productData.availableColors && productData.availableColors.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Available Colors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {productData.availableColors.map((color, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="h-6 w-6 rounded-full border"
                          style={{ backgroundColor: color.toLowerCase() === 'white' ? '#ffffff' : color.toLowerCase() }}
                        />
                        <span className="text-sm capitalize">{color}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Sizes */}
            {productData.availableSizes && productData.availableSizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Available Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {productData.availableSizes.map((size, index) => (
                    <Badge key={index} variant="outline">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={handleImageModalClose}
        imageUrl={productData.imageUrls?.[selectedImageIndex] || '/placeholder.svg'}
        alt={`${productData.productName} ${selectedImageIndex + 1}`}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        title="Sign In to Continue"
        description="Please sign in to purchase this product"
      />

      <Footer />
    </div>
  );
};

export default ProductDetail;