import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";

const Footer = () => {
  const handleNavigation = (path) => {
    window.location.href = path;
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
              <li><a href="#" className="text-background/80 hover:text-primary transition-smooth block py-1">About Us</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-smooth block py-1">Licensing</a></li>
              <li>
                <a 
                  href="/contactUs" 
                  className="text-background/80 hover:text-primary transition-smooth block py-1"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation('/contactUs');
                  }}
                >
                  Become a Designer
                </a>
              </li>
              <li>
                <a 
                  href="/contactUs" 
                  className="text-background/80 hover:text-primary transition-smooth block py-1"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation('/contactUs');
                  }}
                >
                  Help Center
                </a>
              </li>
              <li>
                <a 
                  href="/contactUs" 
                  className="text-background/80 hover:text-primary transition-smooth block py-1"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation('/contactUs');
                  }}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-background mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><a href="/items" className="text-background/80 hover:text-primary transition-smooth block py-1">Tropical</a></li>
              <li><a href="/items" className="text-background/80 hover:text-primary transition-smooth block py-1">Geometric</a></li>
              <li><a href="/items" className="text-background/80 hover:text-primary transition-smooth block py-1">Floral</a></li>
              <li><a href="/items" className="text-background/80 hover:text-primary transition-smooth block py-1">Abstract</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-background/60 text-sm">
            © 2025 Aza Arts. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-background/60 hover:text-primary transition-smooth text-sm">Privacy Policy</a>
            <a href="#" className="text-background/60 hover:text-primary transition-smooth text-sm">Terms of Service</a>
            <a href="#" className="text-background/60 hover:text-primary transition-smooth text-sm">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;