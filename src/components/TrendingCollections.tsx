import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTrendingDesigns } from "@/hooks/useDesigns";
import { useNavigate } from "react-router-dom";

const TrendingCollections = () => {
  const { data: trendingData, isLoading, error } = useTrendingDesigns({ size: 6 });
  const navigate = useNavigate();

  const handleNavigate = (category?: string, subcategory?: string) => {
    console.log("Navigating to items with:", { category, subcategory });
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (subcategory) params.set("subcategory", subcategory);
    navigate(`/items?${params.toString()}`);
  };

  const trendingDesigns =
    trendingData?.content?.slice(0, 6).map((design) => ({
      id: design.id,
      title: design.designName,
      category: design.category,
      subcategory: design.subcategory,
      price: `$${design.discountPrice || design.price}`,
      originalPrice: design.discountPrice ? `$${design.price}` : null,
      image: design.imageUrls?.[0] || "/placeholder.svg",
      isPremium: design.isPremium,
      isTrending: design.isTrending,
      isNewArrival: design.isNewArrival,
    })) || [];

  if (isLoading) {
    return (
      <section className="py-6 bg-muted/30"> {/* reduced padding */}
        <div className="container mx-auto px-4">
          <div className="text-center mb-6"> {/* reduced margin */}
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-3" />
            <div className="h-4 bg-muted rounded w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-3" />
                <div className="h-6 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !trendingDesigns.length) {
    return (
      <section className="py-6 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Trending Collections
            </h2>
            <p className="text-muted-foreground text-sm">
              Unable to load trending designs at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-1 bg-muted/30"> {/* smaller top/bottom gap */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-2"> {/* reduced spacing */}
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Trending Collections
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Discover the most popular design trends that are captivating
            creators worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingDesigns.map((design, index) => (
            <Card
              key={design.id || index}
              className="group overflow-hidden hover:shadow-elegant transition-all duration-300 cursor-pointer"
              onClick={() => handleNavigate(design.category, design.subcategory)}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={design.image}
                    alt={design.title}
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {/* <div className="absolute top-3 left-3 flex gap-2">
                    {design.isPremium && (
                      <Badge className="bg-gradient-primary text-primary-foreground">
                        Premium
                      </Badge>
                    )}
                    {design.isTrending && <Badge variant="secondary">Trending</Badge>}
                    {design.isNewArrival && (
                      <Badge className="bg-accent text-accent-foreground">New</Badge>
                    )}
                  </div> */}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-smooth">
                    {design.title}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-primary font-semibold">{design.price}</p>
                      {design.originalPrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          {design.originalPrice}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{design.subcategory}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-6"> {/* reduced bottom margin */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log("Navigating to all trending designs");
              navigate("/items?type=designs&trending=true");
            }}
            className="bg-background hover:bg-muted"
          >
            View All Trending Designs
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingCollections;
