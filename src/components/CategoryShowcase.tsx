import { Card, CardContent } from "@/components/ui/card";
import patternGrid from "@/assets/pattern-grid.jpg";

const categories = [
  {
    title: "Shop Tropical Designs",
    subtitle: "Vibrant & Exotic",
    image: patternGrid
  },
  {
    title: "Shop Geometric Patterns", 
    subtitle: "Modern & Clean",
    image: patternGrid
  },
  {
    title: "Shop Floral Collections",
    subtitle: "Timeless & Elegant", 
    image: patternGrid
  },
  {
    title: "Shop Abstract Art",
    subtitle: "Bold & Creative",
    image: patternGrid
  }
];

const CategoryShowcase = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-foreground mb-4">
            Shop By Category
          </h2>
          <p className="text-muted-foreground text-lg">
            Find the perfect pattern for your next project
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Card key={index} className="group pattern-hover border-0 shadow-soft">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-48 object-cover transition-smooth group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white/80 text-sm mb-1">
                      {category.subtitle}
                    </p>
                    <h3 className="font-display text-lg font-semibold text-white">
                      {category.title}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;