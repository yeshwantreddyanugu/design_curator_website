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
  orderId: string;
  uid: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  design: {
    id: number;
    designName: string;
    category: string;
    subcategory: string;
    price: number;
    discountPrice?: number;
    availableColors: string[];
    imageUrls: string[];
    tags: string[];
    description: string;
    fileSizePx: string;
    fileSizeCm: string;
    dpi: number;
    includedFiles: string;
    licenseType: string;
    designedBy: string;
  };
  quantity: number;
  totalAmount: number;
  contactDetails: string;
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
  const API_BASE_URL = 'https://az.lytortech.com/api';

  // Razorpay key
  const RAZORPAY_KEY = 'rzp_live_fN6UZTO4YZyRd4';

  // Filter cart items to only include designs
  const designItems = cartItems.filter(item => item.type === 'design');

  // Redirect if no design items in cart
  useEffect(() => {
    if (designItems.length === 0) {
      console.log('🛒 No designs in cart, redirecting to items page');
      navigate('/items');
      toast({
        title: "No designs in cart",
        description: "Please add designs to your cart before checkout.",
        variant: "destructive",
      });
    }
  }, [designItems.length, navigate, toast]);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      console.log('👤 Pre-filling form with user data:', {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      });
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
      console.log('🔐 User not authenticated, showing auth modal');
      setIsAuthModalOpen(true);
    }
  }, [user, designItems.length]);

  // Load Razorpay script
  useEffect(() => {
    console.log('💳 Loading Razorpay script...');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => console.log('✅ Razorpay script loaded successfully');
    script.onerror = () => console.error('❌ Failed to load Razorpay script');
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
        console.log('🧹 Razorpay script removed from DOM');
      }
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    console.log(`📝 Contact form field updated - ${field}:`, value);
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createOrder = async (orderData: OrderData): Promise<CreateOrderResponse> => {
    console.log('🚀 [CREATE ORDER] Starting order creation process...');
    console.log('🚀 [CREATE ORDER] ========== REQUEST DATA ==========');
    console.log('📦 [CREATE ORDER] Order data being sent:', {
      orderId: orderData.orderId,
      uid: orderData.uid,
      email: orderData.email,
      name: orderData.name,
      phone: orderData.phone,
      address: orderData.address,
      quantity: orderData.quantity,
      totalAmount: orderData.totalAmount,
      contactDetails: orderData.contactDetails,
      designId: orderData.design.id,
      designName: orderData.design.designName
    });

    const requestBody = JSON.stringify(orderData);
    console.log('📡 [CREATE ORDER] API Request Configuration:');
    console.log('  📍 URL:', `${API_BASE_URL}/orders`);
    console.log('  📋 Method: POST');
    console.log('  📄 Content-Type: application/json');
    console.log('  🎯 ngrok-skip-browser-warning: true');
    console.log('📦 [CREATE ORDER] Request Body Details:');
    console.log('  📦 Body length:', requestBody.length, 'characters');
    console.log('🚀 [CREATE ORDER] ====================================');

    try {
      console.log('🌐 [CREATE ORDER] Making API call...');
      const requestStartTime = Date.now();

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: requestBody,
      });

      const requestEndTime = Date.now();
      const responseTime = requestEndTime - requestStartTime;

      console.log('📡 [CREATE ORDER] ========== RESPONSE DATA ==========');
      console.log('📡 [CREATE ORDER] Response received in', responseTime, 'ms');
      console.log('  📊 Status Code:', response.status);
      console.log('  📊 Status Text:', response.statusText);
      console.log('  📊 Response OK:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ [CREATE ORDER] Order created successfully!');
        console.log('  📋 Full Response Object:', result);
        console.log('  🎫 Extracted Order ID:', result.order?.orderId);
        console.log('  🔑 Extracted Razorpay Order ID:', result.razorpayOrderId);
        console.log('  💰 Extracted Amount:', result.amount);
        console.log('  💱 Extracted Currency:', result.currency);
        console.log('📡 [CREATE ORDER] ===================================');
        return result;
      } else {
        const errorText = await response.text();
        console.error('❌ [CREATE ORDER] Failed to create order!');
        console.error('❌ [CREATE ORDER] Error Response Details:');
        console.error('  📊 Status Code:', response.status);
        console.error('  📊 Status Text:', response.statusText);
        console.error('  📄 Error Response Body:', errorText);
        console.error('📡 [CREATE ORDER] ===================================');
        throw new Error(`Failed to create order: ${errorText}`);
      }
    } catch (error) {
      console.error('💥 [CREATE ORDER] Exception occurred during API call!');
      console.error('💥 [CREATE ORDER] Error Details:', error);
      console.error('💥 [CREATE ORDER] Error Type:', error.constructor.name);
      console.error('💥 [CREATE ORDER] Error Message:', error.message);
      if (error instanceof TypeError) {
        console.error('  🌐 Network error detected - check internet connection and API availability');
        console.error('  🌐 API URL being called:', `${API_BASE_URL}/orders`);
      }
      console.error('📡 [CREATE ORDER] ===================================');
      throw error;
    }
  };

  const verifyPayment = async (paymentData: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    console.log('🔍 [VERIFY PAYMENT] Starting payment verification process...');
    console.log('🔍 [VERIFY PAYMENT] ========== REQUEST DATA ==========');
    console.log('🔑 [VERIFY PAYMENT] Payment data being sent:', {
      orderId: paymentData.orderId,
      razorpayOrderId: paymentData.razorpayOrderId,
      razorpayPaymentId: paymentData.razorpayPaymentId,
      razorpaySignature: paymentData.razorpaySignature ? `${paymentData.razorpaySignature.substring(0, 10)}...` : 'null'
    });

    const requestBody = JSON.stringify(paymentData);

    try {
      console.log('🌐 [VERIFY PAYMENT] Making API call...');
      const requestStartTime = Date.now();

      const response = await fetch(`${API_BASE_URL}/orders/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: requestBody,
      });

      const requestEndTime = Date.now();
      const responseTime = requestEndTime - requestStartTime;

      console.log('📡 [VERIFY PAYMENT] ========== RESPONSE DATA ==========');
      console.log('📡 [VERIFY PAYMENT] Response received in', responseTime, 'ms');
      console.log('  📊 Status Code:', response.status);
      console.log('  📊 Status Text:', response.statusText);
      console.log('  📊 Response OK:', response.ok);

      // Check for 200 status and treat as success
      if (response.status === 200) {
        console.log('🎉 [VERIFY PAYMENT] Payment verification successful! (Status 200)');
        
        let responseData;
        try {
          responseData = await response.json();
          console.log('📋 [VERIFY PAYMENT] Response body:', responseData);
        } catch (jsonError) {
          console.log('⚠️ [VERIFY PAYMENT] Could not parse JSON response, but status is 200 - treating as success');
          responseData = { message: 'Payment verified successfully' };
        }

        console.log('✅ [VERIFY PAYMENT] Returning success result');
        console.log('📡 [VERIFY PAYMENT] ====================================');
        
        return { 
          success: true, 
          message: responseData?.message || 'Payment verified successfully',
          ...responseData 
        };
      } else {
        const errorText = await response.text();
        console.error('❌ [VERIFY PAYMENT] Payment verification failed!');
        console.error('❌ [VERIFY PAYMENT] Error Response Details:');
        console.error('  📊 Status Code:', response.status);
        console.error('  📊 Status Text:', response.statusText);
        console.error('  📄 Error Response Body:', errorText);
        console.error('📡 [VERIFY PAYMENT] ====================================');
        
        return {
          success: false,
          message: `Payment verification failed with status ${response.status}: ${errorText}`
        };
      }
    } catch (error) {
      console.error('💥 [VERIFY PAYMENT] Exception occurred during API call!');
      console.error('💥 [VERIFY PAYMENT] Error Details:', error);
      console.error('💥 [VERIFY PAYMENT] Error Type:', error.constructor.name);
      console.error('💥 [VERIFY PAYMENT] Error Message:', error.message);
      if (error instanceof TypeError) {
        console.error('  🌐 Network error detected - check internet connection and API availability');
        console.error('  🌐 API URL being called:', `${API_BASE_URL}/orders/verify-payment`);
      }
      console.error('📡 [VERIFY PAYMENT] ====================================');
      
      return {
        success: false,
        message: `Network error: ${error.message}`
      };
    }
  };

  const initializeRazorpay = (orderData: CreateOrderResponse, contactForm: any) => {
    console.log('💳 [RAZORPAY] Initializing Razorpay payment gateway...');
    console.log('💳 [RAZORPAY] Order data for payment:', {
      razorpayOrderId: orderData.razorpayOrderId,
      amount: orderData.amount,
      currency: orderData.currency,
      orderId: orderData.order.orderId
    });

    const options: RazorpayOptions = {
      key: RAZORPAY_KEY,
      amount: 100, // Fixed amount of 1 INR for testing (amount in paise)
      // amount: Math.round(orderData.amount * 100), // Actual amount - commented for testing
      currency: orderData.currency,
      name: 'Pattern Bank',
      description: 'Design Purchase',
      order_id: orderData.razorpayOrderId,
      handler: async (response: RazorpayResponse) => {
        console.log('💰 [RAZORPAY] Payment successful! Razorpay callback triggered');
        console.log('💰 [RAZORPAY] Payment response details:', {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature ? `${response.razorpay_signature.substring(0, 10)}...` : 'null'
        });

        try {
          console.log('🔍 [RAZORPAY] Calling payment verification...');
          const verificationResult = await verifyPayment({
            orderId: orderData.order.orderId,
            razorpayOrderId: orderData.razorpayOrderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          console.log('🔍 [RAZORPAY] Verification result:', verificationResult);

          if (verificationResult.success) {
            console.log('🎉 [RAZORPAY] Payment verified successfully!');

            // Clear cart on successful payment
            clearCart();
            console.log('🧹 [RAZORPAY] Cart cleared after successful payment');

            // Show success modal
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
            console.error('❌ [RAZORPAY] Payment verification failed:', verificationResult.message);

            // Show failure modal
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
          console.error('💥 [RAZORPAY] Payment verification error:', error);

          // Show error modal
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
          console.log('🏁 [RAZORPAY] Payment flow completed, processing flag reset');
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
      console.error('💳 [RAZORPAY] Razorpay SDK not available on window object');
      throw new Error('Razorpay SDK not loaded');
    }

    const razorpay = new window.Razorpay(options);
    console.log('💳 [RAZORPAY] Razorpay instance created successfully');

    razorpay.on('payment.failed', (response: any) => {
      console.error('💸 [RAZORPAY] Payment failed callback triggered:', response.error);

      // Show failure modal for payment failures
      setPaymentResultModal({
        isOpen: true,
        result: {
          success: false,
          message: response.error.description || "Payment was not completed",
          status: 'failed'
        }
      });

      setIsProcessing(false);
      console.log('💸 [RAZORPAY] Payment failure handling completed');
    });

    console.log('💳 [RAZORPAY] Opening Razorpay payment dialog...');
    razorpay.open();
  };

  const handleCheckout = async () => {
    console.log('🛒 [CHECKOUT] Starting checkout process...');

    if (!user) {
      console.log('👤 [CHECKOUT] User not authenticated, opening auth modal');
      setIsAuthModalOpen(true);
      return;
    }

    if (!contactForm.name || !contactForm.email || !contactForm.phone || !contactForm.address) {
      console.log('📝 [CHECKOUT] Missing contact form data');
      toast({
        title: "Missing information",
        description: "Please fill in all contact details.",
        variant: "destructive",
      });
      return;
    }

    if (!window.Razorpay) {
      console.error('💳 [CHECKOUT] Razorpay SDK not loaded');
      toast({
        title: "Payment Error",
        description: "Payment system is not available. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    console.log('⏳ [CHECKOUT] Processing checkout for', designItems.length, 'design items');

    try {
      // Process the first design item for simplicity
      const item = designItems[0];
      console.log('🎯 [CHECKOUT] Processing design item:', {
        id: item.id,
        title: item.title,
        designId: item.designId
      });

      // Generate unique order ID
      const orderId = `ORD${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      console.log('🎫 [CHECKOUT] Generated order ID:', orderId);

      // Format contact details as string
      const contactDetailsString = `Preferred contact via WhatsApp: ${contactForm.phone}`;

      const orderData: OrderData = {
        orderId: orderId,
        uid: user.uid,
        email: user.email || contactForm.email,
        name: user.name || contactForm.name,
        phone: user.phone || contactForm.phone,
        address: user.address || contactForm.address,
        quantity: item.quantity,
        totalAmount: 100, // Fixed for testing
        contactDetails: contactDetailsString,
        design: {
          id: item.designId || parseInt(item.id.split('_')[1]) || 1,
          designName: item.title,
          category: item.category,
          subcategory: item.subcategory || "General",
          price: item.price,
          discountPrice: item.discountPrice,
          availableColors: item.availableColors || ["Red", "Blue", "Green", "Black", "White"],
          imageUrls: [item.image],
          tags: item.tags || ["vintage", "retro", "classic", "business", "professional"],
          description: item.description || "A collection of professionally designed vintage-style logos perfect for businesses looking for a classic, timeless brand identity.",
          fileSizePx: "3000x2000",
          fileSizeCm: "25.4x16.9",
          dpi: 300,
          includedFiles: "AI, EPS, PNG, JPG, PDF",
          licenseType: "Commercial License",
          designedBy: item.designedBy || "Professional Designer Name"
        }
      };

      console.log('📦 [CHECKOUT] Final order data summary:', {
        orderId: orderData.orderId,
        uid: orderData.uid,
        email: orderData.email,
        designId: orderData.design.id,
        designName: orderData.design.designName,
        quantity: orderData.quantity,
        totalAmount: orderData.totalAmount
      });

      console.log('🛒 [CHECKOUT] Calling create order API...');

      // Create order
      const createdOrder = await createOrder(orderData);

      console.log('🎉 [CHECKOUT] Order created successfully, initializing payment...');

      // Initialize Razorpay payment
      initializeRazorpay(createdOrder, contactForm);

    } catch (error) {
      console.error('💥 [CHECKOUT] Checkout error:', error);

      toast({
        title: "Checkout Failed ❌",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });

      setIsProcessing(false);
      console.log('💥 [CHECKOUT] Error handling completed');
    }
  };

  const getTotalAmount = () => {
    const total = designItems.reduce((total, item) => {
      const price = item.discountPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
    console.log('💰 [TOTAL] Calculated total amount:', total);
    return total;
  };

  const handleAuthSuccess = () => {
    console.log('✅ [AUTH] Authentication successful');
    setIsAuthModalOpen(false);
  };

  const handlePaymentModalClose = () => {
    console.log('🔒 [MODAL] Closing payment result modal');
    setPaymentResultModal({ isOpen: false, result: null });
  };

  const handleNavigateToOrders = () => {
    console.log('🧾 [NAVIGATION] Navigating to orders page');
    setPaymentResultModal({ isOpen: false, result: null });
    navigate('/orders');
  };

  const handleShopAgain = () => {
    console.log('🛍️ [NAVIGATION] Navigating to home page for shopping');
    setPaymentResultModal({ isOpen: false, result: null });
    navigate('/');
  };

  if (designItems.length === 0) {
    console.log('🛒 [RENDER] No designs in cart, component will not render');
    return null; // Will redirect in useEffect
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

  console.log('🎨 [RENDER] Rendering checkout component');

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
                          {/* {item.licenseType && (
                            <Badge variant="outline" className="text-xs">
                              {item.licenseType}
                            </Badge>
                          )} */}
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