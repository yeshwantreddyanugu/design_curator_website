import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  orderId?: string;
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const purchaseData: PurchaseData | null = location.state?.purchaseData || null;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    shippingAddress: '',
    paymentMethod: 'razorpay',
    orderNotes: ''
  });

  console.log("💳 PaymentPage Component Render:", { purchaseData, user });

  // Show form modal on component mount
  useEffect(() => {
    console.log("🔄 useEffect [Modal]: Checking if form modal should open");
    console.log("🔄 purchaseData exists:", !!purchaseData);
    console.log("🔄 user exists:", !!user);

    if (purchaseData && user) {
      console.log("✅ Opening form modal");
      setIsFormModalOpen(true);
    } else {
      console.log("❌ Not opening modal - missing data");
    }
  }, [purchaseData, user]);

  // Load Razorpay script
  useEffect(() => {
    console.log("📜 useEffect [Razorpay Script]: Loading Razorpay script...");
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      console.log("✅ Razorpay script loaded successfully");
    };

    script.onerror = () => {
      console.error("❌ Failed to load Razorpay script");
    };

    document.body.appendChild(script);
    console.log("📜 Razorpay script tag added to DOM");

    return () => {
      if (document.body.contains(script)) {
        console.log("🧹 Cleanup: Removing Razorpay script from DOM");
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleInputChange = (field: keyof CustomerDetails, value: string) => {
    console.log(`📝 Input changed: ${field} = "${value}"`);
    setCustomerDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    console.log("🔍 Validating form...");
    console.log("🔍 Current customer details:", customerDetails);

    const required = ['customerName', 'customerEmail', 'customerPhone', 'shippingAddress'];
    for (const field of required) {
      const value = customerDetails[field as keyof CustomerDetails];
      console.log(`🔍 Checking field '${field}': "${value}"`);

      if (!value.trim()) {
        console.log(`❌ Validation failed: ${field} is empty`);
        toast({
          title: "Missing Information",
          description: `Please fill in ${field.replace('customer', '').toLowerCase()}`,
          variant: "destructive",
        });
        return false;
      }
      console.log(`✅ Field '${field}' is valid`);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    console.log(`🔍 Validating email: "${customerDetails.customerEmail}"`);

    if (!emailRegex.test(customerDetails.customerEmail)) {
      console.log("❌ Validation failed: Invalid email format");
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    console.log("✅ Email format is valid");
    console.log("✅ All form validation passed");
    return true;
  };

  // Create order and get razorpayOrderId from response
  const createOrderAndGetRazorpayId = async (): Promise<{ orderId: string; razorpayOrderId: string; databaseId: number } | null> => {
    console.log("🚀 === createOrderAndGetRazorpayId STARTED ===");

    if (!purchaseData) {
      console.log("❌ No purchase data available");
      return null;
    }

    if (!user) {
      console.log("❌ No user data available");
      return null;
    }

    try {
      console.log("🌐 Creating order with backend API...");
      console.log("📦 Product ID from ProductDetail page:", purchaseData.productId);
      console.log("👤 User ID (uid):", user.uid);
      console.log("🌐 Purchase data:", purchaseData);

      const orderPayload = {
        uid: user.uid, // Added: User ID from authenticated user
        productId: purchaseData.productId,
        customerName: customerDetails.customerName,
        customerEmail: customerDetails.customerEmail,
        customerPhone: customerDetails.customerPhone,
        shippingAddress: customerDetails.shippingAddress,
        quantity: purchaseData.quantity,
        selectedColor: purchaseData.selectedColor,
        selectedSize: purchaseData.selectedSize,
        unitPrice: purchaseData.price ,
        paymentMethod: "razorpay",
        orderNotes: customerDetails.orderNotes
      };

      console.log("📤 Order payload prepared (with uid):", JSON.stringify(orderPayload, null, 2));
      console.log("📤 Sending POST request to: https://a39ce974f7a4.ngrok-free.app/api/orders/products");

      const response = await fetch('https://az.lytortech.com/api/orders/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(orderPayload)
      });

      console.log("📥 Response received - Status:", response.status, response.statusText);
      console.log("📥 Response OK:", response.ok);

      const responseText = await response.text();
      console.log("📥 Raw response text:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
        console.log("📥 Parsed response object:", result);
        console.log("📥 result.order structure:", result.order);
      } catch (parseError) {
        console.error("❌ Failed to parse response as JSON");
        console.error("❌ Parse error:", parseError);
        throw new Error("Invalid JSON response from server");
      }

      if (response.ok && result.success) {
        console.log("✅ Response indicates success");

        // Extract different IDs from the response
        const databaseId = result.order?.id; // Database ID (e.g., 59)
        const orderId = result.order?.orderId; // Formatted order ID (e.g., "ORD-20251018-000014")
        const razorpayOrderId = result.order?.razorpayOrderId;

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("👤 USER ID (uid):", user.uid);
        console.log("📦 PRODUCT ID (from ProductDetail):", purchaseData.productId);
        console.log("🆔 DATABASE ID (internal):", databaseId);
        console.log("📋 ORDER ID (formatted):", orderId);
        console.log("💳 RAZORPAY ORDER ID:", razorpayOrderId);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        if (!orderId || !razorpayOrderId || !databaseId) {
          console.error("❌ Missing required IDs in response");
          console.error("❌ orderId:", orderId);
          console.error("❌ razorpayOrderId:", razorpayOrderId);
          console.error("❌ databaseId:", databaseId);
          console.error("❌ Full result.order:", result.order);
          throw new Error('Missing orderId or razorpayOrderId in response');
        }

        console.log("✅ Order created successfully");
        console.log("✅ Formatted Order ID:", orderId);
        console.log("✅ Razorpay Order ID:", razorpayOrderId);
        console.log("✅ Database ID:", databaseId);
        console.log("🚀 === createOrderAndGetRazorpayId COMPLETED SUCCESSFULLY ===");

        return { orderId, razorpayOrderId, databaseId };
      } else {
        console.error("❌ Response indicates failure");
        console.error("❌ Success flag:", result.success);
        console.error("❌ Message:", result.message);
        throw new Error(result.message || 'Failed to create order');
      }
    } catch (error) {
      console.error("❌ === createOrderAndGetRazorpayId FAILED ===");
      console.error("❌ Error object:", error);
      console.error("❌ Error message:", error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };


  // Verify payment after Razorpay success
  const verifyPayment = async (
    orderId: string, // Now using formatted order ID string
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<PaymentResult> => {
    console.log("🚀 === verifyPayment STARTED ===");
    console.log("📥 Parameters received:");
    console.log("   - orderId (formatted):", orderId);
    console.log("   - razorpayOrderId:", razorpayOrderId);
    console.log("   - razorpayPaymentId:", razorpayPaymentId);
    console.log("   - razorpaySignature:", razorpaySignature);

    try {
      console.log("🌐 Preparing to verify payment with backend...");

      const verificationPayload = {
        orderId: orderId, // Formatted order ID like "ORD-20251018-000014"
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: razorpaySignature
      };

      console.log("📤 Verification payload prepared:", JSON.stringify(verificationPayload, null, 2));
      console.log("📤 Sending POST request to: https://a39ce974f7a4.ngrok-free.app/api/orders/products/verify-payment");

      const response = await fetch('https://az.lytortech.com/api/orders/products/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(verificationPayload)
      });

      console.log("📥 Verification response received - Status:", response.status, response.statusText);
      console.log("📥 Response OK:", response.ok);

      const responseText = await response.text();
      console.log("📥 Raw verification response text:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
        console.log("📥 Parsed verification response object:", result);
      } catch (parseError) {
        console.error("❌ Failed to parse verification response as JSON");
        console.error("❌ Parse error:", parseError);
        console.error("❌ Response text was:", responseText);
        console.log("🚀 === verifyPayment COMPLETED WITH PARSE ERROR ===");
        return {
          success: false,
          message: 'Invalid verification response from server',
          orderId: orderId
        };
      }

      const verificationResult = {
        success: result.success || false,
        message: result.message || 'Payment verification completed',
        orderId: orderId
      };

      console.log("📊 Verification result:", verificationResult);
      console.log(verificationResult.success ? "✅ Payment verified successfully" : "❌ Payment verification failed");
      console.log("🚀 === verifyPayment COMPLETED ===");

      return verificationResult;
    } catch (error) {
      console.error("❌ === verifyPayment FAILED WITH EXCEPTION ===");
      console.error("❌ Error object:", error);
      console.error("❌ Error message:", error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        message: 'Payment verification failed',
        orderId: orderId
      };
    }
  };

  // Handle Razorpay payment
  const initiateRazorpayPayment = (razorpayOrderId: string, formattedOrderId: string) => {
    console.log("🚀 === initiateRazorpayPayment STARTED ===");
    console.log("💳 Razorpay Order ID:", razorpayOrderId);
    console.log("📋 Formatted Order ID:", formattedOrderId);
    console.log("📦 Product ID:", purchaseData?.productId);
    console.log("💳 Purchase data:", purchaseData);

    const checkRazorpay = () => {
      console.log("🔍 Checking if Razorpay SDK is loaded...");

      if (window.Razorpay) {
        console.log("✅ Razorpay SDK is available on window object");

        const calculatedAmount = purchaseData!.totalAmount * 100;
        console.log("💰 Total amount (INR):", purchaseData!.totalAmount);
        console.log("💰 Amount for Razorpay (paisa):", calculatedAmount);

        const options = {
          key: 'rzp_live_RLWX63Wyr3DnEa',
          amount: calculatedAmount,
          currency: 'INR',
          name: 'Aza Arts',
          description: `Purchase: ${purchaseData!.productName}`,
          order_id: razorpayOrderId,
          handler: async function (response: any) {
            console.log("🎉 === RAZORPAY PAYMENT HANDLER CALLED ===");
            console.log("💳 ✅ Razorpay payment successful!");
            console.log("💳 Payment response object:", response);
            console.log("💳 razorpay_order_id:", response.razorpay_order_id);
            console.log("💳 razorpay_payment_id:", response.razorpay_payment_id);
            console.log("💳 razorpay_signature:", response.razorpay_signature);

            console.log("🔄 Setting isProcessing to true");
            setIsProcessing(true);

            console.log("🚀 Calling verifyPayment with formatted orderId:", formattedOrderId);
            // Verify payment with backend (using formatted order ID)
            const verificationResult = await verifyPayment(
              formattedOrderId, // Using formatted order ID like "ORD-20251018-000014"
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            console.log("📊 Verification result received:", verificationResult);

            console.log("🔄 Setting payment result state");
            setPaymentResult(verificationResult);

            console.log("🔄 Setting isProcessing to false");
            setIsProcessing(false);

            console.log("🔄 Opening payment modal");
            setIsPaymentModalOpen(true);

            if (verificationResult.success) {
              console.log("✅ Showing success toast");
              toast({
                title: "Payment Successful!",
                description: "Your order has been confirmed.",
              });
            } else {
              console.log("❌ Showing failure toast");
              toast({
                title: "Payment Verification Failed",
                description: verificationResult.message,
                variant: "destructive",
              });
            }

            console.log("🎉 === RAZORPAY PAYMENT HANDLER COMPLETED ===");
          },
          prefill: {
            name: customerDetails.customerName,
            email: customerDetails.customerEmail,
            contact: customerDetails.customerPhone
          },
          notes: {
            productId: purchaseData!.productId,
            orderId: formattedOrderId,
            quantity: purchaseData!.quantity
          },
          theme: {
            color: '#3B82F6'
          },
          modal: {
            ondismiss: function () {
              console.log("💳 ❌ Payment modal dismissed by user");
              console.log("🔄 Setting isProcessing to false");
              setIsProcessing(false);
              toast({
                title: "Payment Cancelled",
                description: "You can retry payment anytime",
              });
            }
          }
        };

        console.log("💳 Razorpay options configured:", {
          key: options.key.substring(0, 10) + "...", // Mask key
          amount: options.amount,
          currency: options.currency,
          name: options.name,
          description: options.description,
          order_id: options.order_id,
          prefill: options.prefill,
          notes: options.notes
        });

        try {
          console.log("💳 Creating new Razorpay instance...");
          const razorpay = new window.Razorpay(options);
          console.log("💳 Razorpay instance created successfully");

          console.log("💳 Opening Razorpay checkout modal...");
          razorpay.open();
          console.log("💳 Razorpay checkout modal opened");
          console.log("🚀 === initiateRazorpayPayment COMPLETED ===");
        } catch (error) {
          console.error("❌ Error creating or opening Razorpay instance");
          console.error("❌ Error object:", error);
          console.error("❌ Error message:", error instanceof Error ? error.message : 'Unknown error');
          setIsProcessing(false);
          toast({
            title: "Payment Error",
            description: "Failed to open payment gateway",
            variant: "destructive",
          });
        }
      } else {
        console.log("⏳ Razorpay SDK not yet loaded, retrying in 100ms...");
        setTimeout(checkRazorpay, 100);
      }
    };

    checkRazorpay();
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 === FORM SUBMISSION STARTED ===");
    console.log("📝 Form submitted by user");
    console.log("📦 Product ID:", purchaseData?.productId);

    console.log("🔍 Validating form...");
    if (!validateForm()) {
      console.log("❌ Form validation failed, stopping submission");
      return;
    }
    console.log("✅ Form validation passed");

    if (!purchaseData) {
      console.log("❌ No purchase data available, stopping submission");
      return;
    }
    console.log("✅ Purchase data available");

    console.log("🔄 Setting isProcessing to true");
    setIsProcessing(true);

    try {
      // Create order and get orderId, razorpayOrderId, and databaseId
      console.log("🚀 === STEP 1: Creating order and getting IDs ===");
      const orderData = await createOrderAndGetRazorpayId();

      if (!orderData) {
        console.error("❌ createOrderAndGetRazorpayId returned null");
        throw new Error('Failed to create order');
      }

      const { orderId, razorpayOrderId, databaseId } = orderData;

      console.log("✅ Order data received successfully");
      console.log("✅ Formatted Order ID:", orderId);
      console.log("✅ Razorpay Order ID:", razorpayOrderId);
      console.log("✅ Database ID:", databaseId);

      console.log("🔄 Closing form modal");
      setIsFormModalOpen(false);

      // Open Razorpay payment
      console.log("🚀 === STEP 2: Opening Razorpay payment interface ===");
      initiateRazorpayPayment(razorpayOrderId, orderId);

      console.log("🚀 === FORM SUBMISSION PROCESS INITIATED SUCCESSFULLY ===");

    } catch (error) {
      console.error("❌ === FORM SUBMISSION FAILED ===");
      console.error("❌ Error object:", error);
      console.error("❌ Error message:", error instanceof Error ? error.message : 'Unknown error');
      console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack trace');

      console.log("🔄 Setting isProcessing to false");
      setIsProcessing(false);

      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewOrders = () => {
    console.log("📦 handleViewOrders called");
    console.log("🔄 Closing payment modal");
    setIsPaymentModalOpen(false);
    console.log("🔄 Navigating to /user-orders");
    navigate('/orders');
  };

  const handleContinueShopping = () => {
    console.log("🛍️ handleContinueShopping called");
    console.log("🔄 Closing payment modal");
    setIsPaymentModalOpen(false);
    console.log("🔄 Navigating to /allProductItems");
    navigate('/');
  };

  const handleCloseModal = () => {
    console.log("❌ handleCloseModal called");
    console.log("🔄 Closing payment modal");
    setIsPaymentModalOpen(false);
    console.log("🔄 Navigating back");
    navigate(-1);
  };

  // Redirect if no purchase data or user
  useEffect(() => {
    console.log("🔄 useEffect [Redirect Check]: Running redirect validation");
    console.log("🔄 purchaseData:", purchaseData);
    console.log("🔄 user:", user);

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

    console.log("✅ Redirect check passed - user and purchase data present");
  }, [purchaseData, user, navigate, toast]);

  const handleGoBack = () => {
    console.log("⬅️ handleGoBack called - navigating back");
    navigate(-1);
  };

  if (!purchaseData || !user) {
    console.log("⚠️ Component rendering null - missing purchaseData or user");
    return null;
  }

  console.log("✅ Component rendering main content");

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
      <Dialog open={isFormModalOpen} onOpenChange={() => { }}>
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
                onClick={() => {
                  console.log("❌ Cancel button clicked in form");
                  navigate(-1);
                }}
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

      {/* Payment Result Modal */}
      {/* Payment Result Modal - Enhanced Design */}
      {/* Payment Result Modal - Fixed Visibility */}
      <Dialog open={isPaymentModalOpen} onOpenChange={() => {
        console.log("🔄 Payment modal onOpenChange triggered");
        setIsPaymentModalOpen(false);
      }}>
        <DialogContent className="sm:max-w-xl max-h-[95vh] overflow-y-auto border-none shadow-2xl p-0">
          {paymentResult?.success ? (
            // SUCCESS MODAL
            <div className="flex flex-col items-center text-center p-6 sm:p-8 bg-gradient-to-b from-green-50 to-white rounded-lg">
              {/* Success Icon with Animation */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-ping"></div>
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-12 w-12 sm:h-14 sm:w-14 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Success Title */}
              <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2 tracking-tight">
                Payment Successful!
              </h2>

              {/* Success Subtitle */}
              <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md leading-relaxed px-4">
                {paymentResult.message || 'Your payment has been verified successfully! Thank you for your purchase.'}
              </p>

              {/* Order ID Card */}
              {paymentResult.orderId && (
                <div className="bg-white border-2 border-green-200 rounded-xl p-4 mb-4 w-full shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wide">
                      Order ID
                    </p>
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <p className="text-base sm:text-lg font-mono font-bold text-green-700 break-all">
                    {paymentResult.orderId}
                  </p>
                </div>
              )}

              {/* What's Next Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6 w-full shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-blue-900 mb-1">What's Next?</p>
                    <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                      Your order will be processed and shipped within <strong>2-3 business days</strong>.
                      You'll receive a confirmation email with tracking details shortly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full mb-4">
                <Button
                  onClick={handleViewOrders}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-5 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  size="lg"
                >
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  View My Orders
                </Button>
                <Button
                  onClick={handleContinueShopping}
                  variant="outline"
                  className="flex-1 border-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 py-5 text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  size="lg"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Continue Shopping
                </Button>
              </div>

              {/* Support Info */}
              <div className="pt-3 border-t border-gray-200 w-full">
                <p className="text-[10px] sm:text-xs text-gray-500 flex items-center justify-center gap-1 sm:gap-2 flex-wrap px-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>Need help? Contact us at{' '}</span>
                  <a href="mailto:support@azaarts.com" className="font-medium text-green-600 hover:text-green-700 underline whitespace-nowrap">
                    support@azaarts.com
                  </a>
                </p>
              </div>
            </div>
          ) : (
            // FAILURE MODAL
            <div className="flex flex-col items-center text-center p-6 sm:p-8 bg-gradient-to-b from-red-50 to-white rounded-lg">
              {/* Error Icon */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-red-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <XCircle className="h-12 w-12 sm:h-14 sm:w-14 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Error Title */}
              <h2 className="text-2xl sm:text-3xl font-bold text-red-800 mb-3 tracking-tight">
                Payment Failed
              </h2>

              {/* Error Message */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 w-full">
                <p className="text-sm sm:text-base text-red-700 leading-relaxed">
                  {paymentResult?.message || 'Unfortunately, your payment could not be processed. Please try again.'}
                </p>
              </div>

              {/* Helpful Tips */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 w-full text-left">
                <p className="text-xs sm:text-sm font-semibold text-orange-900 mb-2">Common Issues:</p>
                <ul className="space-y-1.5 text-xs sm:text-sm text-orange-800">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5 flex-shrink-0">•</span>
                    <span>Insufficient funds in your account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5 flex-shrink-0">•</span>
                    <span>Incorrect card details or expired card</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5 flex-shrink-0">•</span>
                    <span>Network connectivity issues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5 flex-shrink-0">•</span>
                    <span>Transaction limit exceeded</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full">
                <Button
                  onClick={handleCloseModal}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-5 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </Button>

                <Button
                  onClick={handleContinueShopping}
                  variant="outline"
                  className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-5 text-sm sm:text-base font-semibold"
                  size="lg"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Back to Shopping
                </Button>
              </div>

              {/* Support Info */}
              <div className="pt-4 mt-4 border-t border-gray-200 w-full">
                <p className="text-[10px] sm:text-xs text-gray-500">
                  If the problem persists, please contact our support team
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default PaymentPage;
