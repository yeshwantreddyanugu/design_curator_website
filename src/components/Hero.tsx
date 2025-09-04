import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-tropical.jpg";

const Hero = () => {
  return (
    <section className="relative h-[70vh] min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 gradient-hero" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-4">
            <span className="text-white/90 text-lg font-medium tracking-wider">
              - Trending -
            </span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Tropical Haze
          </h1>
          
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-3 text-lg shadow-strong transition-smooth"
          >
            EXPLORE & SHOP NOW
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/20 to-transparent" />
    </section>
  );
};

export default Hero;