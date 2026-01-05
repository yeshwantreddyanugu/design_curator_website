import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNewArrivalDesigns } from "@/hooks/useDesigns";
import DownloadButton from "@/components/DownloadButton";
import patternGrid from "@/assets/pattern-grid.jpg";
import { useNavigate } from "react-router-dom";

const NewArrivals = () => {
  const { data: newArrivalsData, isLoading, error } = useNewArrivalDesigns({ size: 6 });
  const navigate = useNavigate();

  // Handle design clicks
  const handleViewDesign = (design: any) => {
    if (design.id) {
      navigate(`/design/${design.id}`);
    }
  };

  const newArrivals = newArrivalsData?.content?.slice(0, 6).map((design) => ({
    id: design.id,
    title: design.designName,
    designer: design.designedBy || "Aza Arts Designer",
    category: design.category,
    image: design.imageUrls?.[0] || patternGrid,
    isNew: design.isNewArrival
  })) || [
    {
      title: "Sunset Palms",
      designer: "Maria Santos", 
      category: "Tropical",
      image: patternGrid,
      isNew: true
    },
    {
      title: "Modern Minimalist",
      designer: "Alex Chen",
      category: "Geometric", 
      image: patternGrid,
      isNew: true
    },
    {
      title: "Garden Dreams",
      designer: "Emma Wilson",
      category: "Floral",
      image: patternGrid,
      isNew: true
    },
    {
      title: "Urban Abstract",
      designer: "David Kim",
      category: "Abstract",
      image: patternGrid,
      isNew: true
    },
    {
      title: "Vintage Checks",
      designer: "Sarah Johnson", 
      category: "Traditional",
      image: patternGrid,
      isNew: true
    },
    {
      title: "Ocean Waves",
      designer: "Lucas Rivera",
      category: "Nature",
      image: patternGrid,
      isNew: true
    }
  ];

  if (error) {
    console.error('Error loading new arrivals:', error);
  }

  return (
    <section className="py-1 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-2">
          <h2 className="font-display text-4xl font-bold text-foreground mb-4">
            New Arrivals
          </h2>
          <p className="text-muted-foreground text-lg">
            Fresh designs from our talented community of artists
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading new arrivals...</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newArrivals.map((item, index) => (
            <Card 
              key={index} 
              className="group pattern-hover border-0 shadow-soft cursor-pointer"
              onClick={() => handleViewDesign(item)}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-56 object-cover transition-smooth group-hover:scale-110"
                  />
                  {item.isNew && (
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                      NEW
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
                  <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-smooth opacity-0 group-hover:opacity-100">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {item.category}
                    </Badge>
                    <h3 className="font-display text-lg font-semibold text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      by {item.designer}
                    </p>
                  </div>
                </div>
                
                {/* <div className="p-4">
                  {item.id && (
                    <DownloadButton 
                      designId={item.id} 
                      designName={item.title}
                      variant="outline"
                      className="w-full"
                    />
                  )}
                </div> */}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/items?type=designs&new=true")}
            className="bg-gradient-primary text-black font-semibold hover:opacity-90"
          >
            View All New Arrivals
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
