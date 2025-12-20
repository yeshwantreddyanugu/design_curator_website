import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePremiumDesigns } from "@/hooks/useDesigns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import premiumCollection from "@/assets/premium-collection.jpg";

const PremiumSection = () => {
  const { data: premiumData, isLoading } = usePremiumDesigns({ size: 4 });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewDesign = (design: any) => {
    if (design.id) {
      navigate(`/design/${design.id}`);
    }
  };

  const handleCategoryClick = (subcategory: string) => {
    navigate(
      `/items?type=designs&subcategory=${encodeURIComponent(
        subcategory
      )}&premium=true`
    );
  };

  const premiumDesigns =
    premiumData?.content?.slice(0, 4).map((design) => {
      const discount = Number(design.discountPrice) || 0;
      const finalPrice = discount
        ? Number(design.price) -
          (Number(design.price) * discount) / 100
        : Number(design.price);

      return {
        id: design.id,
        title: design.designName,
        category: design.category,
        subcategory: design.subcategory,
        price: Number(design.price),
        discountPercent: discount,
        finalPrice,
        image: design.imageUrls?.[0] || "/placeholder.svg",
        isPremium: design.isPremium,
        fileSizePx: design.fileSizePx,
        fileSizeCm: design.fileSizeCm,
        dpi: design.dpi,
      };
    }) || [];

  if (isLoading) {
    return (
      <section className="py-6 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-40 mb-3" />
              <div className="h-4 bg-muted rounded w-64 mb-4" />
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg" />
                ))}
              </div>
            </div>
            <div className="aspect-square bg-muted rounded-2xl" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-mesh"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-6 items-center">
          {/* Content */}
          <div>
            <Badge className="bg-gradient-primary text-primary-foreground mb-2">
              Premium Collection
            </Badge>
            <h2 className="font-display text-3xl lg:text-5xl font-bold text-foreground mb-3 leading-tight">
              Exclusive Designer
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {" "}
                Patterns
              </span>
            </h2>
            <p className="text-base lg:text-lg text-muted-foreground mb-3 leading-relaxed">
              Access our premium collection featuring hand-crafted designs from
              world-renowned artists. Each pattern is meticulously created with
              attention to detail and artistic excellence.
            </p>

            {/* Premium Design Grid */}
            {premiumDesigns.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {premiumDesigns.map((design, index) => {
                  // hide specs only when all three are 0 / null / undefined
                  const hideSpecs =
                    (!design.fileSizePx || Number(design.fileSizePx) === 0) &&
                    (!design.fileSizeCm || Number(design.fileSizeCm) === 0) &&
                    (!design.dpi || Number(design.dpi) === 0);

                  return (
                    <Card
                      key={design.id || index}
                      onClick={() => handleViewDesign(design)}
                      className="group overflow-hidden hover:shadow-elegant transition-all duration-300 cursor-pointer"
                    >
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden h-40">
                          <img
                            src={design.image}
                            alt={design.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <div className="p-2">
                          <h4 className="font-medium text-sm text-foreground mb-1 truncate">
                            {design.title}
                          </h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <p className="text-primary font-semibold text-sm">
                                ₹{Math.round(design.finalPrice)}
                              </p>
                              {design.discountPercent > 0 && (
                                <p className="text-xs text-muted-foreground line-through">
                                  ₹{design.price.toFixed(2)}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCategoryClick(design.subcategory);
                              }}
                              className="text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                              {design.subcategory}
                            </button>
                          </div>

                          {/* specs as before, but hidden when all three are 0/null */}
                          {!hideSpecs && (
                            <div className="flex items-start justify-start gap-1 mt-3">
                              <p className="text-xs font-semibold text-foreground">
                                {design.fileSizePx} px
                              </p>
                              <span>/</span>
                              <p className="text-xs font-semibold text-foreground">
                                {design.fileSizeCm} cm
                              </p>
                              <span>/</span>
                              <p className="text-xs font-semibold text-foreground">
                                {design.dpi} dpi
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <Button
              size="sm"
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
              onClick={() => navigate("/items?type=designs&premium=true")}
            >
              Explore Premium Collection
            </Button>
          </div>

          {/* Hero Image */}
          <div className="relative mt-4 lg:mt-0">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={premiumCollection}
                alt="Premium Design Collection"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-4 -left-4 w-12 lg:w-16 h-12 lg:h-16 bg-gradient-primary rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-2 -right-2 w-10 lg:w-12 h-10 lg:h-12 bg-gradient-secondary rounded-full opacity-30 animate-pulse delay-700"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumSection;
