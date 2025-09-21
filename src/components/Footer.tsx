import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Footer = () => {
  const navigate = useNavigate(); // Initialize navigate function

  const handleNavigation = (path) => {
    navigate(path); // Use React Router's navigate function
    window.scrollTo(0, 0); // Scroll to top after navigation
  };

  return (
    <footer className="bg-foreground text-background py-16 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-display text-2xl font-bold text-primary mb-4">
              Aza Arts
            </h3>
            <p className="text-background/80 leading-relaxed mb-6 max-w-md">
              The leading destination for exclusively licensed print and pattern designs 
              from the world's finest independent designers.
            </p>
            <div className="flex space-x-4">
              <Instagram className="h-5 w-5 text-background/60 hover:text-primary transition-smooth cursor-pointer" />
              <Twitter className="h-5 w-5 text-background/60 hover:text-primary transition-smooth cursor-pointer" />
              <Facebook className="h-5 w-5 text-background/60 hover:text-primary transition-smooth cursor-pointer" />
              <Youtube className="h-5 w-5 text-background/60 hover:text-primary transition-smooth cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-background mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  className="text-background/80 hover:text-primary transition-smooth block py-1 text-left w-full"
                  onClick={() => handleNavigation('/about')}
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  className="text-background/80 hover:text-primary transition-smooth block py-1 text-left w-full"
                  onClick={() => handleNavigation('/licensing')}
                >
                  Licensing
                </button>
              </li>
              <li>
                <button 
                  className="text-background/80 hover:text-primary transition-smooth block py-1 text-left w-full"
                  onClick={() => handleNavigation('/contactUs')}
                >
                  Become a Designer
                </button>
              </li>
              <li>
                <button 
                  className="text-background/80 hover:text-primary transition-smooth block py-1 text-left w-full"
                  onClick={() => handleNavigation('/help')}
                >
                  Help Center
                </button>
              </li>
              <li>
                <button 
                  className="text-background/80 hover:text-primary transition-smooth block py-1 text-left w-full"
                  onClick={() => handleNavigation('/contactUs')}
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-background mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  className="text-background/80 hover:text-primary transition-smooth block py-1 text-left w-full"
                  onClick={() => handleNavigation('/items')}
                >
                  Tropical
                </button>
              </li>
              <li>
                <button 
                  className="text-background/80 hover:text-primary transition-smooth block py-1 text-left w-full"
                  onClick={() => handleNavigation('/items')}
                >
                  Geometric
                </button>
              </li>
              <li>
                <button 
                  className="text-background/80 hover:text-primary transition-smooth block py-1 text-left w-full"
                  onClick={() => handleNavigation('/items')}
                >
                  Floral
                </button>
              </li>
              <li>
                <button 
                  className="text-background/80 hover:text-primary transition-smooth block py-1 text-left w-full"
                  onClick={() => handleNavigation('/items')}
                >
                  Abstract
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-background/60 text-sm">
            © 2025 Aza Arts. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button 
              className="text-background/60 hover:text-primary transition-smooth text-sm"
              onClick={() => handleNavigation('/privacy')}
            >
              Privacy Policy
            </button>
            <button 
              className="text-background/60 hover:text-primary transition-smooth text-sm"
              onClick={() => handleNavigation('/terms')}
            >
              Terms of Service
            </button>
            <button 
              className="text-background/60 hover:text-primary transition-smooth text-sm"
              onClick={() => handleNavigation('/cookies')}
            >
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;