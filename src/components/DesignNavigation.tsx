import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDesignsByCategory, useDesignsBySubcategory } from "@/hooks/useDesigns";
import { Button } from "@/components/ui/button";

const designCategories = [
  {
    name: "All Designs",
    subcategories: [ "Floral", "World", "Abstract", "Stripes", "Tropical", "Placements", "Camouflage", "Nature", "2 & 3 Colour"]
  },
  {
    name: "Womenswear", 
    subcategories: ["Geometric", "Animals/Birds", "Conversationals", "Checks", "Paisleys", "Traditional", "Texture", "Animal Skins", "Border"]
  },
  {
    name: "Menswear",
    subcategories: ["Stripes", "Checks", "Geometric", "Abstract", "Traditional", "Texture", "Camouflage", "Border"]
  },
  {
    name: "Giftware/Stationery",
    subcategories: ["Floral", "Animals/Birds", "Conversationals", "Geometric", "Abstract", "Nature", "World", "Traditional"]
  },
  {
    name: "Interiors/Home",
    subcategories: ["Floral", "Geometric", "Abstract", "Texture", "Traditional", "Nature", "Stripes", "Checks"]
  },
  {
    name: "Kidswear",
    subcategories: ["Animals/Birds", "Conversationals", "Geometric", "Abstract", "Nature", "World", "Stripes", "Checks"]
  },
  {
    name: "Swimwear",
    subcategories: ["Tropical", "Abstract", "Geometric", "Stripes", "Floral", "Animal Skins", "Nature", "Placements"]
  },
  {
    name: "Activewear",
    subcategories: ["Geometric", "Abstract", "Stripes", "Camouflage", "Texture", "Animal Skins", "Nature", "2 & 3 Colour"]
  },
  {
    name: "Archive",
    subcategories: ["Traditional", "Vintage", "Classic", "Heritage", "Retro", "Historical", "Antique", "Timeless"]
  }
];

interface DesignNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (category?: string, subcategory?: string) => void;
}

const DesignNavigation = ({ isOpen, onClose, onNavigate }: DesignNavigationProps) => {
  const [selectedCategory, setSelectedCategory] = useState("All Designs");
  const [isMobileView, setIsMobileView] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState<string | null>(null);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    if (isMobileView) {
      setMobileCategoryOpen(mobileCategoryOpen === categoryName ? null : categoryName);
    } else {
      setSelectedCategory(categoryName);
    }
  };

  // Handle direct category navigation (new functionality)
  const handleCategoryNavigation = (categoryName: string) => {
    if (onNavigate) {
      const category = categoryName === "All Designs" ? undefined : categoryName;
      onNavigate(category, undefined); // Navigate with category only, no subcategory
    }
    onClose();
  };

  const handleSubcategoryClick = (categoryName: string, subcategory: string) => {
    if (onNavigate) {
      const category = categoryName === "All Designs" ? undefined : categoryName;
      onNavigate(category, subcategory);
    }
    onClose();
  };

  if (!isOpen) return null;

  const currentCategory = designCategories.find(cat => cat.name === selectedCategory);

  return (
    <div className="absolute top-full left-0 right-0 bg-background border-b shadow-elegant z-40 max-h-[80vh] overflow-hidden">
      {/* Mobile Close Button */}
      {isMobileView && (
        <div className="lg:hidden flex justify-end p-2 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="container mx-auto">
        <Card className="border-0 rounded-none">
          <CardContent className="p-0">
            {isMobileView ? (
              // Mobile View - Accordion Style
              <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
                <div className="space-y-2">
                  {designCategories.map((category) => (
                    <div key={category.name} className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/30">
                        {/* Category Header with Navigation Button */}
                        <div className="flex">
                          <button
                            className="flex-1 text-left px-4 py-3 font-medium hover:bg-muted/50 transition-colors"
                            onClick={() => handleCategoryNavigation(category.name)}
                          >
                            {category.name}
                          </button>
                          <button
                            className="px-4 py-3 hover:bg-muted/50 transition-colors border-l"
                            onClick={() => handleCategoryClick(category.name)}
                          >
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform ${
                                mobileCategoryOpen === category.name ? 'rotate-180' : ''
                              }`} 
                            />
                          </button>
                        </div>
                      </div>
                      
                      {mobileCategoryOpen === category.name && (
                        <div className="bg-background p-3">
                          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                            Subcategories:
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {category.subcategories.map((subcategory) => (
                              <button
                                key={subcategory}
                                className="text-left p-2 rounded-md hover:bg-muted/50 transition-smooth text-sm"
                                onClick={() => handleSubcategoryClick(category.name, subcategory)}
                              >
                                {subcategory}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Desktop View - Two Column Layout
              <div className="grid grid-cols-12 min-h-[400px]">
                {/* Left Categories */}
                <div className="col-span-4 bg-muted/30 p-6 overflow-y-auto">
                  <ul className="space-y-1">
                    {designCategories.map((category) => (
                      <li key={category.name}>
                        <div className="flex rounded-lg overflow-hidden">
                          <button
                            className={`flex-1 text-left px-4 py-3 flex items-center group transition-smooth ${
                              selectedCategory === category.name
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted text-foreground"
                            }`}
                            onMouseEnter={() => setSelectedCategory(category.name)}
                            onClick={() => handleCategoryNavigation(category.name)}
                          >
                            <span className="font-medium flex-1">{category.name}</span>
                          </button>
                          <button
                            className={`px-3 py-3 border-l transition-smooth ${
                              selectedCategory === category.name
                                ? "bg-primary/90 text-primary-foreground border-primary-foreground/20"
                                : "hover:bg-muted text-foreground border-border"
                            }`}
                            onMouseEnter={() => setSelectedCategory(category.name)}
                          >
                            <ChevronRight className="h-4 w-4 opacity-60" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Subcategories */}
                <div className="col-span-8 p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{selectedCategory}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCategoryNavigation(selectedCategory)}
                      className="text-xs"
                    >
                      View all {selectedCategory}
                    </Button>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground">
                      Choose a subcategory for more specific filtering:
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {currentCategory?.subcategories.map((subcategory) => (
                      <button
                        key={subcategory}
                        className="text-left p-3 rounded-lg hover:bg-muted/50 transition-smooth text-foreground hover:text-primary border border-transparent hover:border-primary/20"
                        onClick={() => handleSubcategoryClick(selectedCategory, subcategory)}
                      >
                        {subcategory}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DesignNavigation;