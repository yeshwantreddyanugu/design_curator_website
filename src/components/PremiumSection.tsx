
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePremiumDesigns } from "@/hooks/useDesigns";
import { Eye, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import premiumCollection from "@/assets/premium-collection.jpg";

const PremiumSection = () => {
  const { data: premiumData, isLoading, error } = usePremiumDesigns({ size: 4 });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleQuickAdd = (design: any) => {
    toast({
      title: "Added to cart!",
      description: `${design.title} has been added to your cart.`,
    });
  };

  const handleViewDesign = (design: any) => {
    if (design.id) {
      navigate(`/design/${design.id}`);
    }
  };

  const handleCategoryClick = (subcategory: string) => {
    navigate(`/items?type=designs&subcategory=${encodeURIComponent(subcategory)}&premium=true`);
  };

  const premiumDesigns = premiumData?.content?.slice(0, 4).map((design) => ({
    id: design.id,
    title: design.designName,
    category: design.category,
    subcategory: design.subcategory,
    price: `$${design.discountPrice || design.price}`,
    originalPrice: design.discountPrice ? `$${design.price}` : null,
    image: design.imageUrls?.[0] || '/placeholder.svg',
    isPremium: design.isPremium
  })) || [];

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mb-4" />
              <div className="h-4 bg-muted rounded w-96 mb-8" />
              <div className="grid grid-cols-2 gap-4">
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
    <section className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-mesh"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <Badge className="bg-gradient-primary text-primary-foreground mb-6">
              Premium Collection
            </Badge>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Exclusive Designer
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Patterns</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Access our premium collection featuring hand-crafted designs from world-renowned artists. 
              Each pattern is meticulously created with attention to detail and artistic excellence.
            </p>

            {/* Premium Design Grid */}
            {premiumDesigns.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {premiumDesigns.map((design, index) => (
                  <Card key={design.id || index} className="group overflow-hidden hover:shadow-elegant transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden aspect-square">
                        <img
                          src={design.image}
                          alt={design.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onClick={() => handleViewDesign(design)}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => handleQuickAdd(design)}>
                              <ShoppingCart className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleViewDesign(design)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm text-foreground mb-1 truncate">
                          {design.title}
                        </h4>
                        <div className="flex items-center justify-between">
                          <p className="text-primary font-semibold text-sm">
                            {design.price}
                          </p>
                          <button
                            onClick={() => handleCategoryClick(design.subcategory)}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            {design.subcategory}
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Button 
              size="lg" 
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
              onClick={() => navigate("/items?type=designs&premium=true")}
            >
              Explore Premium Collection
            </Button>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={premiumCollection}
                alt="Premium Design Collection"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-primary rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-secondary rounded-full opacity-30 animate-pulse delay-700"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumSection;
