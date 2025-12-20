import { useState } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  FileImage,
  Palette,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
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

  const {
    data: design,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["design", designId],
    queryFn: () => designApi.getDesignById(designId),
    enabled: !!designId,
  });

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
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const handleAddToCart = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!design) {
      toast({
        title: "Error",
        description: "Design information is not available.",
        variant: "destructive",
      });
      return;
    }

    const cartData = {
      type: "design" as const,
      designId: design.id,
      productId: design.id,
      title: design.designName,
      price: parseFloat(String(design.price)),
      discountPrice: design.discountPrice,
      image: design.imageUrls?.[0] || "/placeholder.svg",
      category: design.category,
      productType: "DESIGN",
      subcategory: design.subcategory,
      designedBy: design.designedBy,
      isPremium: design.isPremium,
      isTrending: design.isTrending,
      isNewArrival: design.isNewArrival,
      tags: design.tags,
      availableColors: design.availableColors,
      description: design.description,
      material: "",
      brand: "Aza Arts",
      weight: "",
      dimensions: "",
      careInstructions: "",
      fileSizePx: design.fileSizePx,
      fileSizeCm: design.fileSizeCm,
      dpi: design.dpi,
      includedFiles: design.includedFiles,
      licenseType: design.licenseType,
    };

    try {
      addToCart(cartData);
      toast({
        title: "Added to cart!",
        description: `${design.designName} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add design to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
  };

  const handleImageModalClose = () => {
    setIsModalOpen(false);
  };

  if (isLoading) {
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
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Design not found
            </h1>
            <p className="text-muted-foreground">
              The design you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasMultipleImages =
    design.imageUrls && design.imageUrls.length > 1;

  // -------- LICENSE RENDER HELPER (NEW) ----------
  const renderLicenseBlock = (licenseTypeRaw?: string) => {
    if (!licenseTypeRaw) return null;

    const lt = licenseTypeRaw.toLowerCase().trim();

    // Common wrapper card for better UI
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({
      children,
    }) => (
      <div className="rounded-lg border bg-gradient-to-br from-muted/80 via-background to-muted/40 p-4 md:p-5 space-y-3 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          License details
        </div>
        {children}
      </div>
    );

    if (lt === "commercial") {
      return (
        <Wrapper>
          <p className="text-sm text-foreground">
            You may use AzaArts designs for personal and small-business
            creative projects. Print on artwork, fabrics, accessories, or
            décor items for resale. Original digital files may not be shared,
            resold, or distributed.
          </p>
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Notes / File Details
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>
                • High-resolution TIFF / JPEG / PNG / AI / EPS files (per
                listing).
              </li>
              <li>
                • 300 / 150 DPI — ideal for art prints, fabrics, and
                stationery.
              </li>
              <li>• Instant digital access via secure AzaArts link.</li>
              <li>
                • Colors may vary slightly depending on screen or printer.
              </li>
              <li>• Created with care by the AzaArts Creative Team.</li>
            </ul>
          </div>
        </Wrapper>
      );
    }

    if (lt === "extended") {
      return (
        <Wrapper>
          <p className="text-sm text-foreground">
            Includes personal and full commercial rights for physical and
            digital end products. You may use these files to create printed
            textiles, décor, stationery, and resale artwork.
          </p>
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Notes / File Details
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>
                • High-resolution TIFF / JPEG / PNG / AI / EPS files.
              </li>
              <li>
                • 300 / 150 DPI, suitable for large-scale printing and
                production.
              </li>
              <li>• Instant access through secure AzaArts link.</li>
              <li>
                • Minor color variations may occur across devices.
              </li>
              <li>
                • Professionally crafted and quality-checked by AzaArts
                Studio.
              </li>
            </ul>
          </div>
        </Wrapper>
      );
    }

    // default: personal / professional / anything else
    return (
      <Wrapper>
        <p className="text-sm text-foreground">
          Use AzaArts digital files for commercial production, product
          development, or client projects. Designs can be incorporated into
          your own original works or physical goods for sale. Resale or
          redistribution of original files is not permitted.
        </p>
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Notes / File Details
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>
              • High-resolution TIFF / JPEG / PNG / AI / EPS (per listing
              specs).
            </li>
            <li>
              • 300 / 150 DPI or higher, optimized for production workflows.
            </li>
            <li>• Immediate access via AzaArts’ secure download link.</li>
            <li>
              • Colors may differ slightly based on printer or device.
            </li>
            <li>
              • Delivered by AzaArts Design Studio — professional-grade
              quality.
            </li>
          </ul>
        </div>
      </Wrapper>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            <div
              className="aspect-square overflow-hidden rounded-lg border cursor-pointer select-none relative group bg-muted"
              onClick={() => handleImageClick(selectedImageIndex)}
              onContextMenu={(e) => {
                e.preventDefault();
                return false;
              }}
              style={{ userSelect: "none", WebkitUserSelect: "none" }}
            >
              <img
                src={design.imageUrls?.[selectedImageIndex] || "/placeholder.svg"}
                alt={design.designName}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 ease-out select-none"
                onContextMenu={(e) => {
                  e.preventDefault();
                  return false;
                }}
                onDragStart={(e) => {
                  e.preventDefault();
                  return false;
                }}
                draggable={false}
                style={{
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  WebkitTouchCallout: "none",
                }}
              />

              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPreviousImage();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/55 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNextImage();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/55 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-opacity">
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
                    className={`aspect-square overflow-hidden rounded-lg border-2 cursor-pointer select-none transition-all ${
                      selectedImageIndex === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      return false;
                    }}
                    style={{ userSelect: "none", WebkitUserSelect: "none" }}
                  >
                    <img
                      src={url}
                      alt={`${design.designName} ${index + 1}`}
                      className="w-full h-full object-cover select-none"
                      onContextMenu={(e) => {
                        e.preventDefault();
                        return false;
                      }}
                      onDragStart={(e) => {
                        e.preventDefault();
                        return false;
                      }}
                      draggable={false}
                      style={{
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        WebkitTouchCallout: "none",
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
                  <Badge className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground">
                    Premium
                  </Badge>
                )}
                {design.isTrending && (
                  <Badge variant="secondary">Trending</Badge>
                )}
                {design.isNewArrival && (
                  <Badge className="bg-accent text-accent-foreground">
                    New Arrival
                  </Badge>
                )}
              </div>

              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                {design.designName}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
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

              <div className="flex items-end gap-4 mb-6">
                {design.discountPrice && design.discountPrice > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-primary">
                      ₹
                      {Math.ceil(
                        design.price -
                          (design.price * design.discountPrice) / 100
                      )}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{Math.ceil(design.price)}
                    </span>
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                      {design.discountPrice}% OFF
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
                <p className="text-muted-foreground leading-relaxed">
                  {design.description}
                </p>
              </div>
            )}

            {/* Design Specifications */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileImage className="h-4 w-4 text-primary" />
                    Design Specifications
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Digital download • High-resolution artwork
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 text-sm">
                  {(design.fileSizePx ||
                    design.fileSizeCm ||
                    design.dpi) && (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Size & Resolution
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-medium text-xs">
                        {design.fileSizePx && `${design.fileSizePx} px`}
                        {design.fileSizePx &&
                          design.fileSizeCm &&
                          " / "}
                        {design.fileSizeCm && `${design.fileSizeCm} cm`}
                        {(design.fileSizePx || design.fileSizeCm) &&
                          design.dpi &&
                          " / "}
                        {design.dpi && `${design.dpi} dpi`}
                      </div>
                    </div>
                  )}

                  {design.includedFiles && (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Included Files
                      </div>
                      <div className="rounded-md bg-muted px-2 py-1 font-medium text-xs">
                        {design.includedFiles}
                      </div>
                    </div>
                  )}
                </div>

                {/* License block with richer UI */}
                {design.licenseType && (
                  <div className="pt-2">
                    {renderLicenseBlock(design.licenseType)}
                  </div>
                )}
              </CardContent>
            </Card>

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
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={handleImageModalClose}
          onContextMenu={(e) => {
            e.preventDefault();
            return false;
          }}
        >
          <div
            className="relative max-w-6xl w-full max-h-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => {
              e.preventDefault();
              return false;
            }}
          >
            <div
              className="relative w-full flex justify-center mb-4"
              onContextMenu={(e) => {
                e.preventDefault();
                return false;
              }}
            >
              <button
                onClick={handleImageModalClose}
                className="absolute top-4 right-4 z-20 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors shadow-lg"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

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

              {hasMultipleImages && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/70 text-white px-3 py-1 rounded-full text-sm shadow-lg">
                  {selectedImageIndex + 1} / {design.imageUrls.length}
                </div>
              )}

              <img
                src={design.imageUrls?.[selectedImageIndex] || "/placeholder.svg"}
                alt={`${design.designName} ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg select-none"
                draggable={false}
                onContextMenu={(e) => {
                  e.preventDefault();
                  return false;
                }}
                onDragStart={(e) => {
                  e.preventDefault();
                  return false;
                }}
                onMouseDown={(e) => {
                  if (e.button === 2) e.preventDefault();
                }}
                style={{
                  width: "auto",
                  height: "auto",
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  WebkitTouchCallout: "none",
                  pointerEvents: "auto",
                }}
              />
            </div>

            {hasMultipleImages && (
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 w-full max-w-2xl mt-2">
                <div className="flex gap-2 overflow-x-auto justify-center">
                  {design.imageUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-primary ring-2 ring-primary/50 scale-110"
                          : "border-gray-300 hover:border-primary/50"
                      }`}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        return false;
                      }}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover rounded select-none"
                        draggable={false}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          return false;
                        }}
                        onDragStart={(e) => {
                          e.preventDefault();
                          return false;
                        }}
                        style={{
                          userSelect: "none",
                          WebkitUserSelect: "none",
                          WebkitTouchCallout: "none",
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
