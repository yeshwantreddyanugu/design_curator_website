import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Shield, CheckCircle, XCircle, Package, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface PurchaseData {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  totalAmount: number;
  productImage?: string;
  productType?: string;
  category?: string;
}

interface CustomerDetails {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  orderNotes: string;
}

interface PaymentResult {
  success: boolean;
  message: string;
  orderId?: number;
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Get purchase data from navigation state
  const purchaseData: PurchaseData | null = location.state?.purchaseData || null;

  // Local state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  
  // Customer form data
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    shippingAddress: '',
    paymentMethod: 'Credit Card',
    orderNotes: ''
  });

  // Debug logs
  console.log("💳 PaymentPage Component Render:", {
    purchaseData,
    user,
    isProcessing,
    currentOrderId
  });

  // Show form modal on component mount
  useEffect(() => {
    if (purchaseData && user) {
      setIsFormModalOpen(true);
    }
  }, [purchaseData, user]);

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

  // Handle form input changes
  const handleInputChange = (field: keyof CustomerDetails, value: string) => {
    setCustomerDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate form data
  const validateForm = (): boolean => {
    const required = ['customerName', 'customerEmail', 'customerPhone', 'shippingAddress'];
    for (const field of required) {
      if (!customerDetails[field as keyof CustomerDetails].trim()) {
        toast({
          title: "Missing Information",
          description: `Please fill in ${field.replace('customer', '').toLowerCase()}`,
          variant: "destructive",
        });
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerDetails.customerEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Create order API call
  const createOrder = async (): Promise<number | null> => {
    if (!purchaseData) return null;

    try {
      console.log("🌐 Creating order...");
      const orderPayload = {
        productId: purchaseData.productId,
        customerName: customerDetails.customerName,
        customerEmail: customerDetails.customerEmail,
        customerPhone: customerDetails.customerPhone,
        shippingAddress: customerDetails.shippingAddress,
        quantity: purchaseData.quantity,
        selectedColor: purchaseData.selectedColor,
        selectedSize: purchaseData.selectedSize,
        unitPrice: purchaseData.price,
        totalAmount: purchaseData.totalAmount,
        paymentMethod: customerDetails.paymentMethod,
        orderNotes: customerDetails.orderNotes
      };

      console.log("📤 Order payload:", orderPayload);

      const response = await fetch('https://963392021b17.ngrok-free.app/api/orders/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(orderPayload)
      });

      const result = await response.json();
      console.log("📥 Order creation response:", result);

      if (response.ok && result.success) {
        return result.orderId;
      } else {
        throw new Error(result.message || 'Failed to create order');
      }
    } catch (error) {
      console.error("❌ Order creation error:", error);
      throw error;
    }
  };

  // Create payment order
  const createPaymentOrder = async (orderId: number): Promise<string> => {
    try {
      console.log("🌐 Creating payment order for:", orderId);
      const response = await fetch(`https://963392021b17.ngrok-free.app/api/orders/products/${orderId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      const result = await response.json();
      console.log("📥 Payment order response:", result);

      if (response.ok && result.success) {
        return result.orderId; // Razorpay order ID
      } else {
        throw new Error(result.message || 'Failed to create payment order');
      }
    } catch (error) {
      console.error("❌ Payment order creation error:", error);
      throw error;
    }
  };

  // Verify payment
  const verifyPayment = async (orderId: number, paymentData: any): Promise<PaymentResult> => {
    try {
      console.log("🌐 Verifying payment for order:", orderId);
      const response = await fetch(`https://963392021b17.ngrok-free.app/api/orders/products/${orderId}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature
        })
      });

      const result = await response.json();
      console.log("📥 Payment verification response:", result);

      return {
        success: result.success,
        message: result.message,
        orderId: orderId
      };
    } catch (error) {
      console.error("❌ Payment verification error:", error);
      return {
        success: false,
        message: 'Payment verification failed',
        orderId: orderId
      };
    }
  };

  // Handle Razorpay payment
  const initiateRazorpayPayment = (razorpayOrderId: string, orderId: number) => {
    // Wait for Razorpay to load
    const checkRazorpay = () => {
      if (window.Razorpay) {
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_live_fN6UZTO4YZyRd4',
          amount: purchaseData!.totalAmount * 100,
          currency: 'INR',
          name: 'Aza Arts',
          description: `Purchase: ${purchaseData!.productName}`,
          order_id: razorpayOrderId,
          handler: async function (response: any) {
            console.log("💳 Razorpay payment response:", response);
            
            setIsProcessing(true);
            const verificationResult = await verifyPayment(orderId, response);
            
            setPaymentResult(verificationResult);
            setIsProcessing(false);
            setIsPaymentModalOpen(true);
            
            if (verificationResult.success) {
              toast({
                title: "Payment Successful!",
                description: "Your order has been confirmed.",
              });
            }
          },
          prefill: {
            name: customerDetails.customerName,
            email: customerDetails.customerEmail,
            contact: customerDetails.customerPhone
          },
          notes: {
            productId: purchaseData!.productId,
            quantity: purchaseData!.quantity
          },
          theme: {
            color: '#3B82F6'
          },
          modal: {
            ondismiss: function() {
              console.log("💳 Payment cancelled by user");
              setIsProcessing(false);
              toast({
                title: "Payment Cancelled",
                description: "You can retry payment anytime",
              });
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        setTimeout(checkRazorpay, 100);
      }
    };

    checkRazorpay();
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!purchaseData) return;

    setIsProcessing(true);
    
    try {
      // Step 1: Create Order
      console.log("🚀 Step 1: Creating order...");
      const orderId = await createOrder();
      if (!orderId) throw new Error('Failed to create order');
      
      setCurrentOrderId(orderId);
      setIsFormModalOpen(false);

      // Step 2: Create Payment Order
      console.log("🚀 Step 2: Creating payment order...");
      const razorpayOrderId = await createPaymentOrder(orderId);
      setRazorpayOrderId(razorpayOrderId);
      
      // Step 3: Open Razorpay
      console.log("🚀 Step 3: Opening Razorpay...");
      initiateRazorpayPayment(razorpayOrderId, orderId);

    } catch (error) {
      console.error("❌ Payment process error:", error);
      setIsProcessing(false);
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle payment modal actions
  const handleViewOrders = () => {
    setIsPaymentModalOpen(false);
    navigate('/user-orders');
  };

  const handleContinueShopping = () => {
    setIsPaymentModalOpen(false);
    navigate('/allProductItems');
  };

  const handleCloseModal = () => {
    setIsPaymentModalOpen(false);
    navigate(-1);
  };

  // Redirect if no purchase data or user
  useEffect(() => {
    if (!purchaseData) {
      console.log("❌ No purchase data found, redirecting to products");
      toast({
        title: "No order data",
        description: "Please select a product to purchase.",
        variant: "destructive",
      });
      navigate('/allProductItems');
      return;
    }

    if (!user) {
      console.log("❌ User not authenticated, redirecting to products");
      toast({
        title: "Authentication required",
        description: "Please sign in to continue with payment.",
        variant: "destructive",
      });
      navigate('/allProductItems');
      return;
    }
  }, [purchaseData, user, navigate, toast]);

  // Handle back navigation
  const handleGoBack = () => {
    console.log("⬅️ Going back to product detail");
    navigate(-1);
  };

  // Early return if no data
  if (!purchaseData || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Product
          </Button>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Complete Your Payment
          </h1>
          <p className="text-muted-foreground">
            Secure payment for your order
          </p>
        </div>

        {/* Order Summary */}
        <div className="max-w-md mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Product:</span>
                  <span className="font-medium">{purchaseData.productName}</span>
                </div>
                {purchaseData.selectedColor && (
                  <div className="flex justify-between">
                    <span>Color:</span>
                    <span className="font-medium">{purchaseData.selectedColor}</span>
                  </div>
                )}
                {purchaseData.selectedSize && (
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-medium">{purchaseData.selectedSize}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span className="font-medium">{purchaseData.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price per item:</span>
                  <span className="font-medium">₹{purchaseData.price.toFixed(2)}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">₹{purchaseData.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Status */}
        {isProcessing && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Processing your payment...</p>
          </div>
        )}

        {/* Security Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Secure Payment
            </h3>
            <p className="text-sm text-muted-foreground">
              Your payment information is encrypted and secure with Razorpay.
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Methods
            </h3>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards, debit cards, and UPI payments.
            </p>
          </div>
        </div>
      </main>

      <Footer />

      {/* Customer Details Form Modal */}
      <Dialog open={isFormModalOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Please provide your details to complete the order
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                value={customerDetails.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email *</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerDetails.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number *</Label>
              <Input
                id="customerPhone"
                value={customerDetails.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingAddress">Shipping Address *</Label>
              <Textarea
                id="shippingAddress"
                value={customerDetails.shippingAddress}
                onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                placeholder="Enter your complete address"
                className="min-h-[80px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select 
                value={customerDetails.paymentMethod} 
                onValueChange={(value) => handleInputChange('paymentMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Net Banking">Net Banking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderNotes">Order Notes (Optional)</Label>
              <Textarea
                id="orderNotes"
                value={customerDetails.orderNotes}
                onChange={(e) => handleInputChange('orderNotes', e.target.value)}
                placeholder="Any special instructions for your order"
                className="min-h-[60px]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enhanced Payment Result Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={() => setIsPaymentModalOpen(false)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {paymentResult?.success ? (
            // Success Modal
            <div className="flex flex-col items-center text-center p-6">
              {/* Success Icon */}
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-green-800 mb-4">Payment Successful!</h2>

              {/* Message */}
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {paymentResult.message || 'Your payment has been verified successfully!'}
              </p>

              {/* Order ID */}
              {paymentResult.orderId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 w-full">
                  <p className="text-sm font-semibold text-green-800 mb-1">Order ID</p>
                  <p className="text-base font-mono text-green-700">{paymentResult.orderId}</p>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 w-full">
                <p className="text-sm text-blue-800">
                  <strong>What's next?</strong> Your order will be processed and shipped within 2-3 business days.
                  You will receive a confirmation email with tracking details.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button
                  onClick={handleViewOrders}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                  size="lg"
                >
                  <Package className="w-5 h-5 mr-2" />
                  View My Orders
                </Button>
                <Button
                  onClick={handleContinueShopping}
                  variant="outline"
                  className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 py-3 text-lg"
                  size="lg"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Continue Shopping
                </Button>
              </div>

              {/* Support Info */}
              <p className="text-sm text-gray-500 mt-6">
                Need help? Contact support at support@azaarts.com
              </p>
            </div>
          ) : (
            // Error Modal
            <div className="flex flex-col items-center text-center p-6">
              <XCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-red-800 mb-4">Payment Failed</h2>
              <p className="text-gray-700 mb-6">{paymentResult?.message}</p>
              <Button onClick={handleCloseModal} className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentPage;