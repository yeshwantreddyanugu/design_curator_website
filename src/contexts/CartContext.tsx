import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  type: 'design' | 'product';
  designId?: number;
  productId?: number;
  title: string;
  price: number;
  discountPrice?: number; // This is a percentage discount (e.g., 10 for 10% off)
  image: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  category: string;
  productType?: string;
  availableSizes?: string[];
  availableColors?: string[];
  stockQuantity?: number;
  subcategory: string;
  tags: string[];
  description: string;
  material: string;
  brand: string;
  weight: string;
  dimensions: string;
  careInstructions: string;
  designedBy: string;
  isPremium: boolean | string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Load cart from localStorage on app start
  useEffect(() => {
    const savedCart = localStorage.getItem('patternbank_cart');
    if (savedCart) {
      try {
        const loadedCart = JSON.parse(savedCart);
        console.log('CartContext: Loaded cart from localStorage:', loadedCart);
        setCartItems(loadedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('patternbank_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    console.log('CartContext: Saving cart to localStorage:', cartItems);
    localStorage.setItem('patternbank_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const generateCartItemId = (item: Omit<CartItem, 'id' | 'quantity'>) => {
    // Generate unique ID using timestamp and random string to ensure each addition creates a new item
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    
    if (item.type === 'design') {
      return `design_${item.designId}_${timestamp}_${randomString}`;
    } else {
      // For products, we might want to consider size/color variations as same item
      const baseId = `product_${item.productId}`;
      const sizeColor = `${item.selectedSize || ''}_${item.selectedColor || ''}`;
      return `${baseId}_${sizeColor}_${timestamp}_${randomString}`;
    }
  };

  // Helper function to calculate final price with discount
  const calculateFinalPrice = (price: number, discountPrice?: number) => {
    console.log('CartContext: calculateFinalPrice input - price:', price, 'discountPrice:', discountPrice);
    
    if (discountPrice && discountPrice > 0) {
      const discountAmount = price * discountPrice / 100;
      const finalPrice = price - discountAmount;
      
      console.log('CartContext: Discount calculation:');
      console.log('  - Original price:', price);
      console.log('  - Discount percentage:', discountPrice);
      console.log('  - Discount amount:', discountAmount);
      console.log('  - Final price (before rounding):', finalPrice);
      console.log('  - Final price (rounded):', Math.round(finalPrice));
      
      return finalPrice;
    }
    
    console.log('CartContext: No discount applied, returning original price:', price);
    return price;
  };

  const addToCart = (item: Omit<CartItem, 'id' | 'quantity'>, quantity: number = 1) => {
    console.log("CartContext: Adding item to cart:", item);
    console.log("CartContext: Item price details - price:", item.price, "discountPrice:", item.discountPrice);
    
    // For designs, we always create a new cart item (no quantity increase for existing items)
    // For products, we might want to check for existing items with same size/color
    if (item.type === 'design') {
      // Always create new item for designs
      const itemId = generateCartItemId(item);
      const newItem: CartItem = {
        ...item,
        id: itemId,
        quantity,
      };
      
      console.log("CartContext: Adding new design item:", newItem);
      console.log("CartContext: New item price details - price:", newItem.price, "discountPrice:", newItem.discountPrice);
      
      setCartItems(prevItems => {
        const updatedItems = [...prevItems, newItem];
        console.log("CartContext: Updated cart items:", updatedItems);
        return updatedItems;
      });
      
      toast({
        title: "Added to cart",
        description: `${item.title} has been added to your cart.`,
      });
      
      return;
    }
    
    // For products, check if same item with same size/color exists
    const productBaseId = `product_${item.productId}_${item.selectedSize || ''}_${item.selectedColor || ''}`;
    
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(cartItem => 
        cartItem.type === 'product' && 
        cartItem.productId === item.productId &&
        cartItem.selectedSize === item.selectedSize &&
        cartItem.selectedColor === item.selectedColor
      );
      
      if (existingItemIndex !== -1) {
        // Item already exists, update quantity
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        
        // Check stock limit
        if (item.stockQuantity && newQuantity > item.stockQuantity) {
          toast({
            title: "Stock limit reached",
            description: `Only ${item.stockQuantity} items available in stock.`,
            variant: "destructive",
          });
          return prevItems;
        }
        
        updatedItems[existingItemIndex].quantity = newQuantity;
        
        toast({
          title: "Updated cart",
          description: `${item.title} quantity updated in your cart.`,
        });
        
        return updatedItems;
      } else {
        // New product item, add to cart
        const itemId = generateCartItemId(item);
        const newItem: CartItem = {
          ...item,
          id: itemId,
          quantity,
        };
        
        console.log("CartContext: Adding new product item:", newItem);
        
        toast({
          title: "Added to cart",
          description: `${item.title} has been added to your cart.`,
        });
        
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => {
      const removedItem = prevItems.find(item => item.id === itemId);
      const updatedItems = prevItems.filter(item => item.id !== itemId);
      
      if (removedItem) {
        console.log("CartContext: Removing item from cart:", removedItem);
        toast({
          title: "Removed from cart",
          description: `${removedItem.title} has been removed from your cart.`,
        });
      }
      
      return updatedItems;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === itemId) {
          console.log("CartContext: Updating quantity for item:", item, "new quantity:", quantity);
          
          // Check stock limit
          if (item.stockQuantity && quantity > item.stockQuantity) {
            toast({
              title: "Stock limit reached",
              description: `Only ${item.stockQuantity} items available in stock.`,
              variant: "destructive",
            });
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    console.log("CartContext: Clearing cart");
    setCartItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const getTotalItems = () => {
    const total = cartItems.reduce((total, item) => total + item.quantity, 0);
    console.log("CartContext: Total items in cart:", total);
    return total;
  };

  const getTotalAmount = () => {
    const total = cartItems.reduce((total, item) => {
      const finalPrice = calculateFinalPrice(item.price, item.discountPrice);
      const itemTotal = finalPrice * item.quantity;
      console.log(`CartContext: Item ${item.title} - finalPrice: ${finalPrice}, quantity: ${item.quantity}, itemTotal: ${itemTotal}`);
      return total + itemTotal;
    }, 0);
    
    console.log("CartContext: Total cart amount:", total);
    return total;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalAmount,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};