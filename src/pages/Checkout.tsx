import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/auth/AuthModal';

// Razorpay types
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface OrderData {
  uid: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  designs: { id: number }[];
  quantity: number;
  totalAmount: number;
}

interface CreateOrderResponse {
  order: {
    id: number;
    orderId: string;
    user: any;
    design: any;
    quantity: number;
    totalAmount: number;
    contactDetails: string;
    status: string;
    razorpayOrderId: string;
    createdAt: string;
    updatedAt: string;
  };
  razorpayOrderId: string;
  amount: number;
  currency: string;
}

interface PaymentResult {
  success: boolean;
  message: string;
  orderId?: string;
  status?: string;
}

const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResultModal, setPaymentResultModal] = useState<{
    isOpen: boolean;
    result: PaymentResult | null;
  }>({ isOpen: false, result: null });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // Base API URL
  const API_BASE_URL = 'https://028f702fdabc.ngrok-free.app/api';

  // Razorpay key
  const RAZORPAY_KEY = 'rzp_live_fN6UZTO4YZyRd4';

  // Filter cart items to only include designs
  const designItems = cartItems.filter(item => item.type === 'design');

  // Redirect if no design items in cart
  useEffect(() => {
    if (designItems.length === 0) {
      navigate('/items');
      // toast({
      //   title: "No designs in cart",
      //   description: "Please add designs to your cart before checkout.",
      //   variant: "destructive",
      // });
    }
  }, [designItems.length, navigate, toast]);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setContactForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  // Check authentication on page load
  useEffect(() => {
    if (!user && designItems.length > 0) {
      setIsAuthModalOpen(true);
    }
  }, [user, designItems.length]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createOrder = async (orderData: OrderData): Promise<CreateOrderResponse> => {
    console.log('Creating order with payload:', orderData);
    
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(orderData),
      });

      console.log('Order creation response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Order created successfully:', result);
        return result;
      } else {
        const errorText = await response.text();
        console.error('Failed to create order:', errorText);
        throw new Error(`Failed to create order: ${errorText}`);
      }
    } catch (error) {
      console.error('Exception occurred during API call:', error);
      throw error;
    }
  };

  const verifyPayment = async (paymentData: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    console.log('Verifying payment with data:', {
      ...paymentData,
      razorpaySignature: paymentData.razorpaySignature ? `${paymentData.razorpaySignature.substring(0, 10)}...` : 'null'
    });

    try {
      const response = await fetch(`${API_BASE_URL}/orders/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(paymentData),
      });

      console.log('Payment verification response status:', response.status);

      if (response.status === 200) {
        let responseData;
        try {
          responseData = await response.json();
        } catch (jsonError) {
          responseData = { message: 'Payment verified successfully' };
        }
        
        return { 
          success: true, 
          message: responseData?.message || 'Payment verified successfully',
          ...responseData 
        };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          message: `Payment verification failed with status ${response.status}: ${errorText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Network error: ${error.message}`
      };
    }
  };

  const initializeRazorpay = (orderData: CreateOrderResponse, contactForm: any) => {
    const options: RazorpayOptions = {
      key: RAZORPAY_KEY,
      amount: 100, // Fixed amount of 1 INR for testing (amount in paise)
      currency: orderData.currency,
      name: 'Pattern Bank',
      description: 'Design Purchase',
      order_id: orderData.razorpayOrderId,
      handler: async (response: RazorpayResponse) => {
        try {
          const verificationResult = await verifyPayment({
            orderId: orderData.order.orderId,
            razorpayOrderId: orderData.razorpayOrderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (verificationResult.success) {
            clearCart();

            setPaymentResultModal({
              isOpen: true,
              result: {
                success: true,
                message: verificationResult.message || 'Payment verified successfully! Your order has been confirmed.',
                orderId: orderData.order.orderId,
                status: 'completed'
              }
            });

            toast({
              title: "Payment Successful! 🎉",
              description: "Your order has been confirmed and payment verified.",
            });
          } else {
            setPaymentResultModal({
              isOpen: true,
              result: {
                success: false,
                message: verificationResult.message || "Payment verification failed. Please contact support.",
                orderId: orderData.order.orderId,
                status: 'failed'
              }
            });
          }
        } catch (error) {
          setPaymentResultModal({
            isOpen: true,
            result: {
              success: false,
              message: "Payment verification failed due to network error. Please contact support.",
              orderId: orderData.order.orderId,
              status: 'error'
            }
          });
        } finally {
          setIsProcessing(false);
        }
      },
      prefill: {
        name: contactForm.name,
        email: contactForm.email,
        contact: contactForm.phone,
      },
      theme: {
        color: '#3B82F6',
      },
    };

    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not loaded');
    }

    const razorpay = new window.Razorpay(options);

    razorpay.on('payment.failed', (response: any) => {
      setPaymentResultModal({
        isOpen: true,
        result: {
          success: false,
          message: response.error.description || "Payment was not completed",
          status: 'failed'
        }
      });

      setIsProcessing(false);
    });

    razorpay.open();
  };

  const handleCheckout = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!contactForm.name || !contactForm.email || !contactForm.phone || !contactForm.address) {
      toast({
        title: "Missing information",
        description: "Please fill in all contact details.",
        variant: "destructive",
      });
      return;
    }

    if (!window.Razorpay) {
      toast({
        title: "Payment Error",
        description: "Payment system is not available. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Generate unique order ID
      const orderId = `ORD${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      // Prepare designs array with IDs
      const designs = designItems.map(item => ({
        id: item.designId || parseInt(item.id.split('_')[1]) || 1
      }));

      // Calculate total quantity and amount
      const quantity = designItems.reduce((total, item) => total + item.quantity, 0);
      const totalAmount = designItems.reduce((total, item) => {
        const price = item.discountPrice || item.price;
        return total + (price * item.quantity);
      }, 0);

      const orderData: OrderData = {
        uid: user.uid,
        email: user.email || contactForm.email,
        name: user.name || contactForm.name,
        phone: user.phone || contactForm.phone,
        address: user.address || contactForm.address,
        designs: designs,
        quantity: quantity,
        totalAmount: 100 // Fixed for testing
      };

      // Create order
      const createdOrder = await createOrder(orderData);

      // Initialize Razorpay payment
      initializeRazorpay(createdOrder, contactForm);

    } catch (error) {
      toast({
        title: "Checkout Failed ❌",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });

      setIsProcessing(false);
    }
  };

  const getTotalAmount = () => {
    const total = designItems.reduce((total, item) => {
      const price = item.discountPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
    return total;
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  const handlePaymentModalClose = () => {
    setPaymentResultModal({ isOpen: false, result: null });
  };

  const handleNavigateToOrders = () => {
    setPaymentResultModal({ isOpen: false, result: null });
    navigate('/orders');
  };

  const handleShopAgain = () => {
    setPaymentResultModal({ isOpen: false, result: null });
    navigate('/');
  };

  if (designItems.length === 0) {
    return null;
  }

  const renderPaymentResultModal = () => {
    if (!paymentResultModal.result || !paymentResultModal.isOpen) return null;

    const { success, message, orderId } = paymentResultModal.result;

    return (
      <Dialog open={paymentResultModal.isOpen} onOpenChange={handlePaymentModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={`text-center text-xl font-semibold ${success ? 'text-green-600' : 'text-red-600'}`}>
              {success ? '🎉 Payment Successful!' : '❌ Payment Failed'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-6 px-4">
            {success ? (
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            ) : (
              <XCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
            )}
            
            <div className="text-center space-y-4">
              <DialogDescription className="text-base leading-relaxed text-gray-700">
                {message}
              </DialogDescription>
              
              {orderId && (
                <div className={`border p-4 rounded-lg ${success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className={`text-sm font-medium ${success ? 'text-green-800' : 'text-red-800'}`}>Order ID</div>
                  <div className={`text-sm font-mono mt-1 ${success ? 'text-green-700' : 'text-red-700'}`}>{orderId}</div>
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                {success 
                  ? "Thank you for your purchase! You can track your order status in the orders section."
                  : "If you need assistance, please contact our support team with your order details."
                }
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-center gap-3">
            {success ? (
              <div className="flex gap-3 w-full">
                <Button 
                  variant="outline" 
                  onClick={handlePaymentModalClose} 
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  Close
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleShopAgain} 
                  className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  Shop Again
                </Button>
                <Button 
                  onClick={handleNavigateToOrders} 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  My Orders
                </Button>
              </div>
            ) : (
              <div className="flex gap-3 w-full">
                <Button 
                  variant="outline" 
                  onClick={handlePaymentModalClose} 
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  Close
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-6 md:mb-8">Checkout - Design Purchase</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Fill in your contact details for design delivery
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      value={contactForm.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter your address for billing purposes"
                      rows={3}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary - Designs Only */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Design Summary</CardTitle>
                  <CardDescription>
                    Review your design purchases before placing the order
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {designItems.map((item) => (
                    <div key={item.id} className="flex gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            Digital Design
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 gap-1">
                          <span className="text-sm">Qty: {item.quantity}</span>
                          <span className="font-semibold text-sm">
                            ₹{((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Files: AI, EPS, PNG, JPG, PDF
                        </div>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>Subtotal</span>
                      <span>₹{getTotalAmount().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>Digital Delivery</span>
                      <span>Free</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{getTotalAmount().toFixed(2)}</span>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <div className="font-medium mb-1">Digital Delivery</div>
                        <div className="text-xs">
                          Your design files will be delivered digitally via email after successful payment verification.
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isProcessing || !user}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing Payment...
                      </div>
                    ) : (
                      `Purchase Designs - ₹${getTotalAmount().toFixed(2)}`
                    )}
                  </Button>

                  {!user && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please sign in to complete your design purchase
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Design License Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">License Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Commercial use allowed</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>High-resolution files included</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Multiple file formats (AI, EPS, PNG, JPG, PDF)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Lifetime access to downloads</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        title="Sign In to Continue"
        description="Please sign in to complete your design purchase"
      />

      {/* Enhanced Payment Result Modal */}
      {renderPaymentResultModal()}
    </div>
  );
};

export default Checkout;