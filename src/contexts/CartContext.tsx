import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  type: 'design' | 'product';
  designId?: number;
  productId?: number;
  title: string;
  price: number;
  discountPrice?: number;
  image: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  category: string;
  productType?: string;
  availableSizes?: string[];
  availableColors?: string[];
  stockQuantity?: number;
  subcategory:string;
  tags:string[];
  description:string;
  material:string;
  brand:string;
  weight :string;
  dimensions:string;
  careInstructions:string;
  designedBy:string;
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
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('patternbank_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('patternbank_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const generateCartItemId = (item: Omit<CartItem, 'id' | 'quantity'>) => {
    const baseId = item.type === 'design' ? `design_${item.designId}` : `product_${item.productId}`;
    const sizeColor = `${item.selectedSize || ''}_${item.selectedColor || ''}`;
    return `${baseId}_${sizeColor}`;
  };

  const addToCart = (item: Omit<CartItem, 'id' | 'quantity'>, quantity: number = 1) => {
    const itemId = generateCartItemId(item);
    
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(cartItem => cartItem.id === itemId);
      
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
        return updatedItems;
      } else {
        // New item, add to cart
        const newItem: CartItem = {
          ...item,
          id: itemId,
          quantity,
        };
        
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
    setCartItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      const price = item.discountPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
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