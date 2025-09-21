import { useState } from "react";
import { Search, User, Heart, ChevronDown, LogOut, Menu, X, LayoutGrid, Package, PenTool, Star, Layers, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import DesignNavigation from "./DesignNavigation";
import CustomDesignForm from "./CustomDesignForm";
import AuthModal from "./auth/AuthModal";
import CartIcon from "./cart/CartIcon";
import CartDrawer from "./cart/CartDrawer";

const Header = () => {
  const [isDesignNavOpen, setIsDesignNavOpen] = useState(false);
  const [isCustomFormOpen, setIsCustomFormOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isOpen: isCartOpen, setIsOpen: setIsCartOpen } = useCart();

  const handleNavigate = (category?: string, subcategory?: string) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (subcategory) params.set('subcategory', subcategory);
    navigate(`/items?${params.toString()}`);
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <>
      <header className="bg-background border-b shadow-soft sticky top-0 z-50"
        onMouseLeave={() => setIsDesignNavOpen(false)}
      >
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="font-display text-xl md:text-3xl font-bold text-primary hover:text-primary/80 transition-smooth"
              >
                Aza Arts
              </button>
            </div>

            {/* Navigation - Hidden on mobile */}

            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <div className="relative">
                <button
                  className="text-foreground hover:text-primary transition-smooth font-medium flex items-center gap-1"
                  onClick={() => setIsDesignNavOpen((prev) => !prev)}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Designs
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <button
                className="text-foreground hover:text-primary transition-smooth font-medium flex items-center gap-1"
                onClick={() => navigate('/allProductItems')}
              >
                <Package className="h-4 w-4" />
                Products
              </button>

              <button
                className="text-foreground hover:text-primary transition-smooth font-medium flex items-center gap-1"
                onClick={() => setIsCustomFormOpen(true)}
              >
                <PenTool className="h-4 w-4" />
                Custom Project
              </button>

              <button
                className="text-foreground hover:text-primary transition-smooth font-medium flex items-center gap-1"
                onClick={() => navigate('/items?premium=true')}
              >
                <Star className="h-4 w-4" />
                Premium
              </button>

              <button
                className="text-foreground hover:text-primary transition-smooth font-medium flex items-center gap-1"
                onClick={() => navigate('/items')}
              >
                <Layers className="h-4 w-4" />
                All Designs
              </button>

              <button
                className="text-foreground hover:text-primary transition-smooth font-medium flex items-center gap-1"
                onClick={() => navigate('/seller-application')}
              >
                <Store className="h-4 w-4" />
                Become a Seller
              </button>
            </nav>


            {/* Search and Actions */}
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Search - Hidden on mobile */}
              {/* <form onSubmit={handleSearch} className="relative hidden xl:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search patterns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-48 xl:w-64 bg-muted/50 border-border focus:border-primary"
                />
              </form> */}

              {/* Mobile search button */}
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden hover:text-primary"
                onClick={() => navigate('/items')}
              >
                <Search className="h-5 w-5" />
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:text-primary">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="font-medium">
                      {user.name}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-muted-foreground text-xs">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  <User className="h-5 w-5" />
                </Button>
              )}

              <Button variant="ghost" size="icon" className="hidden sm:flex hover:text-primary">
                <Heart className="h-5 w-5" />
              </Button>

              <CartIcon onClick={() => setIsCartOpen(true)} />

              {/* Mobile Menu Button - Positioned after Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:text-primary"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Design Navigation Dropdown */}
        <DesignNavigation
          isOpen={isDesignNavOpen}
          onClose={() => setIsDesignNavOpen(false)}
          onNavigate={handleNavigate}
        />

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-background border-t absolute top-full right-0 w-64 shadow-lg rounded-bl-md">
            <div className="px-4 py-4">
              <div className="flex flex-col space-y-4">
                {/* Designs Dropdown */}
                <div className="relative">
                  <button
                    className="text-foreground hover:text-primary transition-smooth font-medium flex items-center gap-2 w-full justify-between"
                    onClick={() => setIsDesignNavOpen(!isDesignNavOpen)}
                  >
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4" />
                      Designs
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isDesignNavOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                  {isDesignNavOpen && (
                    <div className="mt-2 pl-6">
                      <button
                        className="block w-full text-left py-2 text-foreground hover:text-primary"
                        onClick={() => handleNavigate("clothing", "dresses")}
                      >
                        Dresses
                      </button>
                      <button
                        className="block w-full text-left py-2 text-foreground hover:text-primary"
                        onClick={() => handleNavigate("clothing", "tops")}
                      >
                        Tops
                      </button>
                      <button
                        className="block w-full text-left py-2 text-foreground hover:text-primary"
                        onClick={() => handleNavigate("home", "decor")}
                      >
                        Home Decor
                      </button>
                    </div>
                  )}
                </div>

                {/* Custom Design */}
                <button
                  className="text-foreground hover:text-primary transition-smooth font-medium flex items-center gap-2 text-left"
                  onClick={() => {
                    setIsCustomFormOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <PenTool className="h-4 w-4" />
                  Custom Project
                </button>

                {/* Premium */}
                <button
                  className="text-foreground hover:text-primary transition-smooth font-medium flex items-center gap-2 text-left"
                  onClick={() => {
                    navigate("/items?premium=true");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Star className="h-4 w-4" />
                  Premium
                </button>

                {/* All Designs */}
                <button
                  className="text-foreground hover:text-primary transition-smooth font-medium flex items-center gap-2 text-left"
                  onClick={() => {
                    navigate("/items");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Layers className="h-4 w-4" />
                  All Designs
                </button>

                {/* Become a Seller */}
                <button
                  className="text-foreground hover:text-primary transition-smooth font-medium flex items-center gap-2 text-left"
                  onClick={() => {
                    navigate("/seller-application");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Store className="h-4 w-4" />
                  Become a Seller
                </button>

                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="pt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="search"
                      placeholder="Search patterns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full bg-muted/50 border-border focus:border-primary"
                    />
                  </div>
                </form>

                {/* Mobile Auth Options */}
                <div className="pt-4 border-t">
                  {user ? (
                    <div className="flex flex-col space-y-3">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-muted-foreground text-xs">{user.email}</div>
                      <button
                        className="text-foreground hover:text-primary text-left"
                        onClick={() => {
                          navigate("/orders");
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        My Orders
                      </button>
                      <button
                        className="text-foreground hover:text-primary text-left"
                        onClick={() => {
                          navigate("/profile");
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Profile Settings
                      </button>
                      <button
                        className="text-destructive text-left flex items-center"
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button
                      className="text-foreground hover:text-primary font-medium"
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Custom Design Form Modal */}
      <CustomDesignForm
        isOpen={isCustomFormOpen}
        onClose={() => setIsCustomFormOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Sign In Required"
        description="Please sign in to access your account"
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
};

export default Header;