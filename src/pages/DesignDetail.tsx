import { useState } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, FileImage, Palette, ChevronLeft, ChevronRight, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/auth/AuthModal";
import { designApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const DesignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const designId = parseInt(id || "0");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const { data: design, isLoading, error } = useQuery({
    queryKey: ['design', designId],
    queryFn: () => designApi.getDesignById(designId),
    enabled: !!designId,
  });

  // Navigation functions for image gallery
  const goToNextImage = () => {
    if (design && design.imageUrls && design.imageUrls.length > 1) {
      setSelectedImageIndex((prev) =>
        prev === design.imageUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const goToPreviousImage = () => {
    if (design && design.imageUrls && design.imageUrls.length > 1) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? design.imageUrls.length - 1 : prev - 1
      );
    }
  };

  const handleImageClick = (index: number) => {
    console.log(`Image clicked: index ${index}`);
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const handleAddToCart = () => {
    console.log("=== ADD TO CART - DESIGN DETAIL PAGE ===");
    console.log("Design data received from API:", design);

    if (!user) {
      console.log("User not authenticated, opening login modal");
      setIsAuthModalOpen(true);
      return;
    }

    if (!design) {
      console.log("No design data available");
      toast({
        title: "Error",
        description: "Design information is not available.",
        variant: "destructive",
      });
      return;
    }

    console.log("=== CART DATA PREPARATION ===");

    // Prepare cart data
    const cartData = {
      type: 'design' as const,
      designId: design.id,
      productId: design.id,
      title: design.designName,
      price: parseFloat(String(design.price)),
      discountPrice: design.discountPrice,
      image: design.imageUrls?.[0] || '/placeholder.svg',
      category: design.category,
      productType: 'DESIGN',
      subcategory: design.subcategory,
      designedBy: design.designedBy,
      isPremium: design.isPremium,
      isTrending: design.isTrending,
      isNewArrival: design.isNewArrival,
      tags: design.tags,
      availableColors: design.availableColors,
      description: design.description,
      material: '',
      brand: 'Aza Arts',
      weight: '',
      dimensions: '',
      careInstructions: '',
      fileSizePx: design.fileSizePx,
      fileSizeCm: design.fileSizeCm,
      dpi: design.dpi,
      includedFiles: design.includedFiles,
      licenseType: design.licenseType
    };

    console.log("=== CART DATA ANALYSIS ===");
    console.log("Cart data being sent:");
    console.log(JSON.stringify(cartData, null, 2));

    try {
      console.log("=== CALLING addToCart FUNCTION ===");
      addToCart(cartData);

      console.log("=== CART ADDITION SUCCESS ===");
      console.log("Successfully added design to cart with ID:", cartData.designId);

      toast({
        title: "Added to cart!",
        description: `${design.designName} has been added to your cart.`,
      });
    } catch (error) {
      console.error("=== CART ADDITION ERROR ===");
      console.error("Error adding design to cart:", error);

      toast({
        title: "Error",
        description: "Failed to add design to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAuthModalClose = () => {
    console.log("Auth modal closed");
    setIsAuthModalOpen(false);
  };

  const handleImageModalClose = () => {
    console.log("Image modal closed");
    setIsModalOpen(false);
  };

  if (isLoading) {
    console.log("Loading design data...");
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

  if (error || !design) {
    console.error("Error loading design or design not found:", error);
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Design not found</h1>
            <p className="text-muted-foreground">The design you're looking for doesn't exist or has been removed.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  console.log("Rendering design detail for:", design.designName, "with ID:", design.id);

  const hasMultipleImages = design.imageUrls && design.imageUrls.length > 1;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            <div
              className="aspect-square overflow-hidden rounded-lg border cursor-pointer select-none relative group"
              onClick={() => handleImageClick(selectedImageIndex)}
              onContextMenu={(e) => { e.preventDefault(); return false; }}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            >
              <img
                src={design.imageUrls?.[selectedImageIndex] || '/placeholder.svg'}
                alt={design.designName}
                className="w-full h-full object-cover hover:scale-105 transition-smooth select-none"
                onContextMenu={(e) => { e.preventDefault(); return false; }}
                onDragStart={(e) => { e.preventDefault(); return false; }}
                draggable={false}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none'
                }}
              />

              {/* Navigation Buttons - Only show if multiple images */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPreviousImage();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNextImage();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {selectedImageIndex + 1} / {design.imageUrls.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {hasMultipleImages && (
              <div className="grid grid-cols-4 gap-2">
                {design.imageUrls.slice(0, 4).map((url, index) => (
                  <div
                    key={index}
                    className={`aspect-square overflow-hidden rounded-lg border-2 cursor-pointer select-none transition-all ${selectedImageIndex === index
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                      }`}
                    onClick={() => setSelectedImageIndex(index)}
                    onContextMenu={(e) => { e.preventDefault(); return false; }}
                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                  >
                    <img
                      src={url}
                      alt={`${design.designName} ${index + 1}`}
                      className="w-full h-full object-cover select-none"
                      onContextMenu={(e) => { e.preventDefault(); return false; }}
                      onDragStart={(e) => { e.preventDefault(); return false; }}
                      draggable={false}
                      style={{
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        WebkitTouchCallout: 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Design Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {design.isPremium && (
                  <Badge className="bg-gradient-primary text-primary-foreground" style={{ display: 'flex', opacity: 1, visibility: 'visible' }}>
                    Premium
                  </Badge>
                )}
                {design.isTrending && (
                  <Badge variant="secondary">Trending</Badge>
                )}
                {design.isNewArrival && (
                  <Badge className="bg-accent text-accent-foreground">New Arrival</Badge>
                )}
              </div>

              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                {design.designName}
              </h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>{design.category}</span>
                <span>•</span>
                <span>{design.subcategory}</span>
                {design.designedBy && (
                  <>
                    <span>•</span>
                    <span>by {design.designedBy}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 mb-6">
                {design.discountPrice && design.discountPrice > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-primary">
                      ₹{Math.ceil(design.price - (design.price * design.discountPrice) / 100)}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{Math.ceil(design.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    ₹{Math.ceil(design.price)}
                  </span>
                )}
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>

            <Separator />

            {/* Description */}
            {design.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{design.description}</p>
              </div>
            )}

            {/* Design Specifications */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  Design Specifications
                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {(design.fileSizePx || design.fileSizeCm || design.dpi) && (
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Size:</div>
                      <div className="font-medium">
                        {design.fileSizePx && `${design.fileSizePx} px`}
                        {design.fileSizePx && design.fileSizeCm && " / "}
                        {design.fileSizeCm && `${design.fileSizeCm} cm`}
                        {(design.fileSizePx || design.fileSizeCm) && design.dpi && " / "}
                        {design.dpi && `${design.dpi} dpi`}
                      </div>
                    </div>
                  )}

                  {design.includedFiles && (
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Included Files:</div>
                      <div className="font-medium">{design.includedFiles}</div>
                    </div>
                  )}

                  {design.licenseType && (
                    <div className="space-y-1">
                      <div className="text-muted-foreground">License:</div>
                      <div className="font-medium">{design.licenseType}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Available Colors */}
            {/* {design.availableColors && design.availableColors.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Featured Colors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {design.availableColors.map((color, index) => (
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
            )} */}

            {/* Tags */}
            {design.tags && design.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {design.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Custom Image Modal with Thumbnail Navigation */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={handleImageModalClose}
        >
          <div
            className="relative max-w-6xl w-full max-h-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Positioned on the image itself */}
            <div className="relative w-full flex justify-center mb-4">
              {/* Close Button - Now positioned on the image container */}
              <button
                onClick={handleImageModalClose}
                className="absolute top-4 right-4 z-20 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors shadow-lg"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* Navigation Buttons */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={goToPreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/70 text-white p-2 sm:p-3 rounded-full hover:bg-black/90 transition-colors shadow-lg"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                  <button
                    onClick={goToNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/70 text-white p-2 sm:p-3 rounded-full hover:bg-black/90 transition-colors shadow-lg"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {hasMultipleImages && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/70 text-white px-3 py-1 rounded-full text-sm shadow-lg">
                  {selectedImageIndex + 1} / {design.imageUrls.length}
                </div>
              )}

              {/* Main Image */}
              <img
                src={design.imageUrls?.[selectedImageIndex] || '/placeholder.svg'}
                alt={`${design.designName} ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '100%',
                  maxHeight: '70vh'
                }}
              />
            </div>

            {/* Thumbnail Navigation - Below the main image */}
            {hasMultipleImages && (
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 w-full max-w-2xl mt-2">
                <div className="flex gap-2 overflow-x-auto justify-center">
                  {design.imageUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded border-2 transition-all ${selectedImageIndex === index
                          ? 'border-primary ring-2 ring-primary/50 scale-110'
                          : 'border-gray-300 hover:border-primary/50'
                        }`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        title="Sign In to Continue"
        description="Please sign in to add designs to your cart"
      />

      <Footer />
    </div>
  );
};

export default DesignDetail;