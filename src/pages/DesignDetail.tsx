import { useState } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, FileImage, Palette } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageModal from "@/components/ImageModal";
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

  const handleImageClick = (index: number) => {
    console.log(`Image clicked: index ${index}`);
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const handleAddToCart = () => {
    console.log("Add to cart clicked for design:", design);
    console.log("Current user authentication status:", !!user);
    
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

    console.log("User is authenticated, proceeding with cart addition");
    console.log("Adding design to cart with data:", {
      type: 'design',
      productId: design.id,
      title: design.designName,
      price: design.discountPrice || design.price,
      discountPrice: design.discountPrice ? design.price : undefined,
      image: design.imageUrls?.[0],
      category: design.category,
      productType: 'DESIGN'
    });

    try {
      addToCart({
        type: 'design',
        productId: design.id,
        title: design.designName,
        price: parseFloat(String(design.discountPrice || design.price)),
        discountPrice: design.discountPrice ? parseFloat(String(design.price)) : undefined,
        image: design.imageUrls?.[0] || '/placeholder.svg',
        category: design.category,
        productType: 'DESIGN',
        subcategory: design.subcategory,
        designedBy: design.designedBy,
        isPremium: design.isPremium,
        isTrending: design.isTrending,
        isNewArrival: design.isNewArrival,
        tags: design.tags,
        availableColors: design.availableColors
      });

      console.log("Successfully added design to cart");
      toast({
        title: "Added to cart!",
        description: `${design.designName} has been added to your cart.`,
      });
    } catch (error) {
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

  console.log("Rendering design detail for:", design.designName);

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
                src={design.imageUrls?.[0] || '/placeholder.svg'}
                alt={design.designName}
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
            {design.imageUrls && design.imageUrls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {design.imageUrls.slice(1, 5).map((url, index) => (
                  <div 
                    key={index} 
                    className="aspect-square overflow-hidden rounded-lg border cursor-pointer select-none"
                    onClick={() => handleImageClick(index + 1)}
                    onContextMenu={(e) => { e.preventDefault(); return false; }}
                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                  >
                    <img
                      src={url}
                      alt={`${design.designName} ${index + 2}`}
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

          {/* Design Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {design.isPremium && (
                  <Badge className="bg-gradient-primary text-primary-foreground">Premium</Badge>
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
                <span className="text-2xl font-bold text-primary">
                  ${design.discountPrice || design.price}
                </span>
                {design.discountPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${design.price}
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
                  {design.fileSizePx && (
                    <div>
                      <span className="text-muted-foreground">Size (pixels):</span>
                      <p className="font-medium">{design.fileSizePx}</p>
                    </div>
                  )}
                  
                  {design.fileSizeCm && (
                    <div>
                      <span className="text-muted-foreground">Size (cm):</span>
                      <p className="font-medium">{design.fileSizeCm}</p>
                    </div>
                  )}
                  
                  {design.dpi && (
                    <div>
                      <span className="text-muted-foreground">DPI:</span>
                      <p className="font-medium">{design.dpi}</p>
                    </div>
                  )}
                  
                  {design.includedFiles && (
                    <div>
                      <span className="text-muted-foreground">Included Files:</span>
                      <p className="font-medium">{design.includedFiles}</p>
                    </div>
                  )}
                  
                  {design.licenseType && (
                    <div>
                      <span className="text-muted-foreground">License:</span>
                      <p className="font-medium">{design.licenseType}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Available Colors */}
            {design.availableColors && design.availableColors.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Available Colors
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
            )}

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

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={handleImageModalClose}
        imageUrl={design.imageUrls?.[selectedImageIndex] || '/placeholder.svg'}
        alt={`${design.designName} ${selectedImageIndex + 1}`}
      />

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