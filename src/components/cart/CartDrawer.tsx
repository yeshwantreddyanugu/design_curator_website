import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cartItems, updateQuantity, removeFromCart, getTotalAmount, getTotalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      navigate('/checkout');
    }
    onClose();
  };

  // Helper function to calculate final price with discount
  const calculateFinalPrice = (price: number, discountPrice?: number) => {
    console.log('CartDrawer: calculateFinalPrice input - price:', price, 'discountPrice:', discountPrice);
    
    if (discountPrice && discountPrice > 0) {
      const discountAmount = price * discountPrice / 100;
      const finalPrice = price - discountAmount;
      
      console.log('CartDrawer: Discount calculation:');
      console.log('  - Original price:', price);
      console.log('  - Discount percentage:', discountPrice);
      console.log('  - Discount amount:', discountAmount);
      console.log('  - Final price (before rounding):', finalPrice);
      console.log('  - Final price (rounded up):', Math.ceil(finalPrice));
      
      return finalPrice;
    }
    
    console.log('CartDrawer: No discount applied, returning original price:', price);
    return price;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="font-display flex items-center gap-2 text-lg">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({getTotalItems()})
          </SheetTitle>
          <SheetDescription>
            Review your items before checkout
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-4">Start shopping to add items to your cart</p>
              <Button onClick={() => { onClose(); navigate('/items'); }}>
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => {
                console.log('CartDrawer: Processing item:', item);
                console.log('CartDrawer: Item price details:', {
                  title: item.title,
                  price: item.price,
                  discountPrice: item.discountPrice,
                  quantity: item.quantity
                });

                const finalPrice = calculateFinalPrice(item.price, item.discountPrice);
                const itemTotal = finalPrice * item.quantity;
                const originalTotal = item.price * item.quantity;
                const hasDiscount = item.discountPrice && item.discountPrice > 0;
                
                console.log('CartDrawer: Calculated values:', {
                  finalPrice,
                  itemTotal,
                  originalTotal,
                  hasDiscount,
                  finalPriceRoundedUp: Math.ceil(finalPrice),
                  itemTotalRoundedUp: Math.ceil(itemTotal),
                  originalTotalRoundedUp: Math.ceil(originalTotal)
                });
                
                return (
                  <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{item.category}</span>
                            {item.productType && (
                              <>
                                <span>•</span>
                                <span>{item.productType}</span>
                              </>
                            )}
                            {item.subcategory && (
                              <>
                                <span>•</span>
                                <span>{item.subcategory}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive -mt-1 -mr-1 flex-shrink-0"
                          onClick={() => removeFromCart(item.id)}
                          title="Remove from cart"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Show additional item details */}
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {item.selectedSize && (
                          <Badge variant="outline" className="text-xs px-1">
                            {item.selectedSize}
                          </Badge>
                        )}
                        {item.selectedColor && (
                          <Badge variant="outline" className="text-xs px-1">
                            {item.selectedColor}
                          </Badge>
                        )}
                        {item.isPremium && (
                          <Badge className="text-xs px-1 bg-gradient-primary text-primary-foreground">
                            Premium
                          </Badge>
                        )}
                        {item.designedBy && (
                          <Badge variant="outline" className="text-xs px-1">
                            by {item.designedBy}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex flex-col items-end">
                            <p className="font-semibold text-sm">
                              ₹{Math.round(itemTotal)}
                            </p>
                            {hasDiscount && (
                              <p className="text-xs text-muted-foreground line-through">
                                ₹{Math.round(originalTotal)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t pt-4 sticky bottom-0 bg-background">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span>Items ({getTotalItems()})</span>
                <span>{cartItems.length} unique products</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal</span>
                <span className="font-semibold">
                  ₹{Math.round(getTotalAmount())}
                </span>
              </div>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleCheckout}
            >
              {user ? 'Proceed to Checkout' : 'Login to Checkout'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;