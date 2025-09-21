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
import { CheckCircle, XCircle, AlertCircle, ShoppingBag, FileText, Sparkles } from 'lucide-react';
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

// Updated OrderData interface to match backend expectations
interface OrderData {
  uid: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  designs: {
    id: number;
    designName: string;
    category: string;
    subcategory: string;
    price: number;
    discountPrice: number;
    availableColors: string[];
    imageUrls: string[];
    tags: string[];
    description: string;
    fileSizePx: string;
    fileSizeCm: string;
    dpi: number;
    includedFiles: string;
    licenseType: string;
    isPremium: boolean;
    isTrending: boolean;
    isNewArrival: boolean;
  }[];
  quantity: number;
  totalAmount: number;
  status: string;
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
  const [shouldPreventRedirect, setShouldPreventRedirect] = useState(false);
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
  const API_BASE_URL = 'https://963392021b17.ngrok-free.app/api';

  // Razorpay key
  const RAZORPAY_KEY = 'rzp_live_fN6UZTO4YZyRd4';

  // Filter cart items to only include designs
  const designItems = cartItems.filter(item => item.type === 'design');

  // Redirect if no design items in cart (but only if not during payment process)
  useEffect(() => {
    if (designItems.length === 0 && !shouldPreventRedirect) {
      navigate('/items');
    }
  }, [designItems.length, navigate, shouldPreventRedirect]);

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
    console.log('=== CREATE ORDER API CALL ===');
    console.log('Endpoint: POST /api/orders');
    console.log('Request Data:', JSON.stringify(orderData, null, 2));

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(orderData),
      });

      console.log('Response Status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Response Data:', JSON.stringify(result, null, 2));
        return result;
      } else {
        const errorText = await response.text();
        console.log('Error Response:', errorText);
        throw new Error(`Failed to create order: ${errorText}`);
      }
    } catch (error) {
      console.log('Network Error:', error);
      throw error;
    }
  };

  const verifyPayment = async (paymentData: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    console.log('=== VERIFY PAYMENT API CALL ===');
    console.log('Endpoint: POST /api/orders/verify-payment');
    console.log('Request Data:', JSON.stringify(paymentData, null, 2));

    try {
      const response = await fetch(`${API_BASE_URL}/orders/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(paymentData),
      });

      console.log('Response Status:', response.status);

      if (response.status === 200) {
        let responseData;
        try {
          responseData = await response.json();
          console.log('Response Data:', JSON.stringify(responseData, null, 2));
        } catch (jsonError) {
          responseData = { message: 'Payment verified successfully' };
          console.log('Response Data: Payment verified successfully (no JSON response)');
        }

        return {
          success: true,
          message: responseData?.message || 'Payment verified successfully',
          ...responseData
        };
      } else {
        const errorText = await response.text();
        console.log('Error Response:', errorText);
        return {
          success: false,
          message: `Payment verification failed with status ${response.status}: ${errorText}`
        };
      }
    } catch (error) {
      console.log('Network Error:', error);
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
        console.log('=== RAZORPAY HANDLER CALLED ===');
        console.log('Razorpay Response:', response);
        
        try {
          const verificationResult = await verifyPayment({
            orderId: orderData.order.orderId,
            razorpayOrderId: orderData.razorpayOrderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          console.log('=== VERIFICATION RESULT ===');
          console.log('Success:', verificationResult.success);
          console.log('Message:', verificationResult.message);

          // Show success modal if verification response status is 200 (regardless of response content)
          if (verificationResult.success) {
            console.log('=== SHOWING SUCCESS MODAL ===');
            // Prevent automatic redirect until user makes a choice
            setShouldPreventRedirect(true);
            clearCart();

            const modalData = {
              isOpen: true,
              result: {
                success: true,
                message: 'Payment verified successfully! Your order has been confirmed.',
                orderId: orderData.order.orderId,
                status: 'completed'
              }
            };

            console.log('Setting payment result modal:', modalData);
            setPaymentResultModal(modalData);

            toast({
              title: "Payment Successful!",
              description: "Your order has been confirmed and payment verified.",
            });
          } else {
            console.log('=== SHOWING FAILURE MODAL ===');
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
          console.log('=== ERROR IN VERIFICATION ===');
          console.error('Error:', error);
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
      // Calculate total quantity and amount
      const quantity = designItems.reduce((total, item) => total + item.quantity, 0);
      const totalAmount = designItems.reduce((total, item) => {
        const originalPrice = item.price;
        const discountPercentage = item.discountPrice || 0;
        const discountAmount = originalPrice * discountPercentage / 100;
        const finalPrice = originalPrice - discountAmount;
        const roundedFinalPrice = Math.ceil(finalPrice);
        return total + (roundedFinalPrice * item.quantity);
      }, 0);

      // Transform cart items to match backend design format
      const designs = designItems.map(item => {
        const originalPrice = item.price;
        const discountPercentage = item.discountPrice || 0;
        const discountAmount = originalPrice * discountPercentage / 100;
        const finalDiscountedPrice = originalPrice - discountAmount;

        return {
          id: item.designId,
          designName: item.title,
          category: item.category,
          subcategory: item.subcategory || 'n',
          price: originalPrice,
          discountPrice: Math.ceil(finalDiscountedPrice), // This should be the final discounted price, not percentage
          availableColors: item.availableColors || [],
          imageUrls: [item.image],
          tags: item.tags || [],
          description: item.description || '',
          fileSizePx: (item as any).fileSizePx || '1600x1280',
          fileSizeCm: (item as any).fileSizeCm || '56.44x45.16', 
          dpi: (item as any).dpi || 72,
          includedFiles: (item as any).includedFiles || 'WEBP, SVG, PNG, AI, EPS, JPEG',
          licenseType: (item as any).licenseType || 'Commercial',
          isPremium: item.isPremium === true || item.isPremium === 'true',
          isTrending: (item as any).isTrending === true || (item as any).isTrending === 'true',
          isNewArrival: (item as any).isNewArrival === true || (item as any).isNewArrival === 'true'
        };
      });

      const orderData: OrderData = {
        uid: user.uid,
        email: user.email || contactForm.email,
        name: user.name || contactForm.name,
        phone: user.phone || contactForm.phone,
        address: user.address || contactForm.address,
        designs: designs,
        quantity: quantity,
        totalAmount: totalAmount, // Use calculated total amount
        status: 'PENDING'
      };

      // Create order
      const createdOrder = await createOrder(orderData);

      // Initialize Razorpay payment
      initializeRazorpay(createdOrder, contactForm);

    } catch (error) {
      console.log('Checkout Error:', error);
      toast({
        title: "Checkout Failed",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });

      setIsProcessing(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  const handlePaymentModalClose = () => {
    setPaymentResultModal({ isOpen: false, result: null });
  };

  const handleNavigateToOrders = () => {
    setPaymentResultModal({ isOpen: false, result: null });
    setShouldPreventRedirect(false); // Reset redirect prevention
    navigate('/orders');
  };

  const handleShopMore = () => {
    setPaymentResultModal({ isOpen: false, result: null });
    setShouldPreventRedirect(false); // Reset redirect prevention
    navigate('/items');
  };

  if (designItems.length === 0 && !shouldPreventRedirect) {
    return null;
  }

  const renderPaymentResultModal = () => {
    if (!paymentResultModal.isOpen || !paymentResultModal.result) return null;

    const { success, message, orderId } = paymentResultModal.result;

    if (success) {
      return (
        <Dialog open={paymentResultModal.isOpen} onOpenChange={handlePaymentModalClose}>
          <DialogContent className="sm:max-w-lg">
            <div className="relative overflow-hidden">
              {/* Success Animation Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 opacity-60"></div>
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-100 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10 p-6">
                <DialogHeader className="text-center space-y-4">
                  {/* Success Icon with Animation */}
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <CheckCircle className="h-12 w-12 text-white" />
                  </div>
                  
                  <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                    Payment Successful!
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                  </DialogTitle>
                  
                  <DialogDescription className="text-gray-600 text-base leading-relaxed">
                    Congratulations! Your payment has been processed successfully and your designs are ready for download.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-8 space-y-6">
                  {/* Order Details Card */}
                  <div className="bg-white border border-green-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Order Confirmed</h3>
                        <p className="text-sm text-gray-500">Your designs will be delivered via email</p>
                      </div>
                    </div>
                    
                    {orderId && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-700">Order ID</div>
                        <div className="text-sm font-mono text-gray-900 mt-1 break-all">{orderId}</div>
                      </div>
                    )}
                  </div>

                  {/* Features Highlight */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-blue-900">What's Next?</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Check your email for download links</li>
                          <li>• Access high-resolution design files</li>
                          <li>• Use for commercial and personal projects</li>
                          <li>• Lifetime access to your purchases</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleShopMore}
                      className="flex-1 h-12 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 font-medium"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Shop More Designs
                    </Button>
                    <Button
                      onClick={handleNavigateToOrders}
                      className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View My Orders
                    </Button>
                  </div>

                  {/* Divider with text */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-gray-500">Thank you for choosing Pattern Bank</span>
                    </div>
                  </div>

                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    onClick={handlePaymentModalClose}
                    className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    } else {
      // Failure Modal (keep existing design)
      return (
        <Dialog open={paymentResultModal.isOpen} onOpenChange={handlePaymentModalClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-semibold text-red-600">
                Payment Failed
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center py-6 px-4">
              <XCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />

              <div className="text-center space-y-4">
                <DialogDescription className="text-base leading-relaxed text-gray-700">
                  {message}
                </DialogDescription>

                {orderId && (
                  <div className="border p-4 rounded-lg bg-red-50 border-red-200">
                    <div className="text-sm font-medium text-red-800">Order ID</div>
                    <div className="text-sm font-mono mt-1 text-red-700">{orderId}</div>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  If you need assistance, please contact our support team with your order details.
                </div>
              </div>
            </div>

            <DialogFooter className="sm:justify-center gap-3">
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={handlePaymentModalClose}
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }
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
                  {designItems.map((item) => {
                    // Calculate final price with discount
                    const originalPrice = item.price;
                    const discountPercentage = item.discountPrice || 0;
                    const discountAmount = originalPrice * discountPercentage / 100;
                    const finalPrice = originalPrice - discountAmount;
                    const roundedFinalPrice = Math.ceil(finalPrice);
                    const itemTotal = roundedFinalPrice * item.quantity;
                    const originalTotal = originalPrice * item.quantity;
                    const hasDiscount = discountPercentage > 0;

                    return (
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
                            {hasDiscount && (
                              <Badge className="text-xs bg-green-100 text-green-800">
                                {discountPercentage}% OFF
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 gap-1">
                            <span className="text-sm">Qty: {item.quantity}</span>
                            <div className="text-right">
                              <span className="font-semibold text-sm">
                                ₹{itemTotal}
                              </span>
                              {hasDiscount && (
                                <div className="text-xs text-muted-foreground line-through">
                                  ₹{originalTotal}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Files: AI, EPS, PNG, JPG, PDF
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>Subtotal</span>
                      <span>₹{Math.ceil(designItems.reduce((total, item) => {
                        const originalPrice = item.price;
                        const discountPercentage = item.discountPrice || 0;
                        const discountAmount = originalPrice * discountPercentage / 100;
                        const finalPrice = originalPrice - discountAmount;
                        const roundedFinalPrice = Math.ceil(finalPrice);
                        return total + (roundedFinalPrice * item.quantity);
                      }, 0))}</span>
                    </div>
                    {/* Show total savings if there are discounts */}
                    {designItems.some(item => item.discountPrice > 0) && (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <span>Total Savings</span>
                        <span>-₹{Math.ceil(
                          designItems.reduce((total, item) => total + (item.price * item.quantity), 0) -
                          designItems.reduce((total, item) => {
                            const originalPrice = item.price;
                            const discountPercentage = item.discountPrice || 0;
                            const discountAmount = originalPrice * discountPercentage / 100;
                            const finalPrice = originalPrice - discountAmount;
                            const roundedFinalPrice = Math.ceil(finalPrice);
                            return total + (roundedFinalPrice * item.quantity);
                          }, 0)
                        )}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>Digital Delivery</span>
                      <span>Free</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{Math.ceil(designItems.reduce((total, item) => {
                      const originalPrice = item.price;
                      const discountPercentage = item.discountPrice || 0;
                      const discountAmount = originalPrice * discountPercentage / 100;
                      const finalPrice = originalPrice - discountAmount;
                      const roundedFinalPrice = Math.ceil(finalPrice);
                      return total + (roundedFinalPrice * item.quantity);
                    }, 0))}</span>
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
                      `Purchase Designs - ₹${Math.ceil(designItems.reduce((total, item) => {
                        const originalPrice = item.price;
                        const discountPercentage = item.discountPrice || 0;
                        const discountAmount = originalPrice * discountPercentage / 100;
                        const finalPrice = originalPrice - discountAmount;
                        const roundedFinalPrice = Math.ceil(finalPrice);
                        return total + (roundedFinalPrice * item.quantity);
                      }, 0))}`
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