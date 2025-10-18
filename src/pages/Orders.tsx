import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Package, Calendar, CreditCard, MapPin, Palette, ShoppingBag, Truck, CheckCircle, Clock, XCircle, Download } from 'lucide-react';

// Design Order Interface
interface DesignOrder {
  id: number;
  orderId: string;
  uid: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  designs: Design[];
  quantity: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Design {
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
  isPremium: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  designedBy: string;
}

// Product Order Interface
interface ProductOrder {
  id: number;
  uid: string;
  product: Product;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  unitPrice: number;
  totalPrice: number;
  orderStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderId: string;
  paymentMethod?: string;
  trackingNumber?: string;
  orderNotes?: string;
  orderDate: string;
  shippedDate?: string;
  deliveredDate?: string;
  createdAt: string;
  updatedAt?: string;
  razorpayOrderId?: string;
  paymentId?: string;
  razorpaySignature?: string;
}

interface Product {
  id: number;
  productName: string;
  productType: string;
  category: string;
  subcategory: string;
  price: number;
  discountPrice?: number;
  availableColors: string[];
  availableSizes: string[];
  imageUrls: string[];
  description: string;
  stockQuantity: number;
}

const Orders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('designs');
  const [designOrders, setDesignOrders] = useState<DesignOrder[]>([]);
  const [productOrders, setProductOrders] = useState<ProductOrder[]>([]);
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      toast({
        title: "Authentication required",
        description: "Please sign in to view your orders.",
        variant: "destructive",
      });
      return;
    }

    fetchDesignOrders();
    fetchProductOrders();
  }, [user]);

  const fetchDesignOrders = async () => {
    if (!user) return;

    setIsLoadingDesigns(true);
    try {
      const response = await fetch(`https://az.lytortech.com/api/orders/user/${user.uid}`, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      console.log('📦 Fetching design orders for UID:', user.uid);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Design orders received:', data);
        setDesignOrders(Array.isArray(data) ? data : []);
      } else {
        console.error('❌ Failed to fetch design orders:', response.status);
        setDesignOrders([]);
      }
    } catch (error) {
      console.error('❌ Error fetching design orders:', error);
      setDesignOrders([]);
      toast({
        title: "Error",
        description: "Failed to load design orders.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDesigns(false);
    }
  };

  const fetchProductOrders = async () => {
    if (!user) return;

    setIsLoadingProducts(true);
    try {
      const response = await fetch(`https://az.lytortech.com/api/orders/products/get/${user.uid}`, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      console.log('🛍️ Fetching product orders for UID:', user.uid);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Product orders received:', data);
        setProductOrders(Array.isArray(data) ? data : []);
      } else {
        console.error('❌ Failed to fetch product orders:', response.status);
        setProductOrders([]);
      }
    } catch (error) {
      console.error('❌ Error fetching product orders:', error);
      setProductOrders([]);
      toast({
        title: "Error",
        description: "Failed to load product orders.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const getDesignStatusBadge = (status: DesignOrder['status']) => {
    const badges = {
      'PAID': { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      'COMPLETED': { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      'PENDING': { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      'FAILED': { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      'CANCELLED': { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
    };
    return badges[status] || badges['PENDING'];
  };

  const getProductStatusBadge = (status: ProductOrder['orderStatus']) => {
    const badges = {
      'DELIVERED': { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600', label: 'Delivered' },
      'SHIPPED': { variant: 'secondary' as const, icon: Truck, color: 'text-blue-600', label: 'Shipped' },
      'PROCESSING': { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600', label: 'Processing' },
      'PENDING': { variant: 'outline' as const, icon: Clock, color: 'text-gray-600', label: 'Pending' },
      'CANCELLED': { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600', label: 'Cancelled' },
    };
    return badges[status] || badges['PENDING'];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number | undefined | null) => {
    // Handle undefined, null, or non-number values
    if (price === undefined || price === null || isNaN(price)) {
      return '₹0.00';
    }
    return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };


  // Helper function to safely get image URL
  const getImageUrl = (imageUrls: string[] | undefined) => {
    return imageUrls && imageUrls.length > 0 ? imageUrls[0] : '/placeholder.svg';
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  My Orders
                </h1>
                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                  Track and manage your design and product purchases
                </p>
              </div>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="self-start sm:self-auto border-2 hover:border-purple-500 hover:text-purple-600"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12 mb-8">
              <TabsTrigger value="designs" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Palette className="w-4 h-4" />
                <span className="font-semibold">Design Orders</span>
                {designOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{designOrders.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Package className="w-4 h-4" />
                <span className="font-semibold">Product Orders</span>
                {productOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{productOrders.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Design Orders Tab */}
            <TabsContent value="designs" className="mt-0">
              {isLoadingDesigns ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your design orders...</p>
                </div>
              ) : designOrders.length === 0 ? (
                <Card className="text-center py-16 border-2 border-dashed">
                  <CardContent>
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Palette className="h-10 w-10 text-purple-600" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">No Design Orders Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      You haven't purchased any designs yet. Browse our collection to find stunning patterns and designs.
                    </p>
                    <Button onClick={() => navigate('/designs')} className="bg-purple-600 hover:bg-purple-700">
                      <Palette className="w-4 h-4 mr-2" />
                      Browse Designs
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {designOrders.map((order) => {
                    const statusBadge = getDesignStatusBadge(order.status);
                    const StatusIcon = statusBadge.icon;

                    return (
                      <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 pb-4">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="font-mono text-xs">
                                  {order.orderId}
                                </Badge>
                                <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                                  <StatusIcon className="w-3 h-3" />
                                  {order.status}
                                </Badge>
                              </div>
                              <CardTitle className="text-xl flex items-center gap-2">
                                <Palette className="w-5 h-5 text-purple-600" />
                                Design Order #{order.id}
                              </CardTitle>
                              <CardDescription className="flex flex-wrap items-center gap-4 mt-3">
                                <span className="flex items-center gap-1.5 text-sm">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(order.createdAt)}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-purple-700">
                                  <CreditCard className="h-4 w-4" />
                                  {formatPrice(order.totalAmount)}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm">
                                  <Package className="h-4 w-4" />
                                  {order.designs?.length || 0} Design{(order.designs?.length || 0) > 1 ? 's' : ''}
                                </span>
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-6">
                          {/* Designs Grid */}
                          {order.designs && order.designs.length > 0 && (
                            <div className="mb-6">
                              <h4 className="font-semibold text-sm text-gray-700 mb-4 flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                Purchased Designs
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {order.designs.map((design) => (
                                  <div key={design.id} className="flex gap-3 p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border">
                                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                                      <img
                                        src={getImageUrl(design.imageUrls)}
                                        alt={design.designName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.src = '/placeholder.svg';
                                        }}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-semibold text-sm truncate">{design.designName}</h5>
                                      <p className="text-xs text-muted-foreground">{design.category} • {design.subcategory}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        {design.discountPrice ? (
                                          <>
                                            <span className="text-sm font-bold text-purple-700">{formatPrice(design.discountPrice)}</span>
                                            <span className="text-xs line-through text-gray-400">{formatPrice(design.price)}</span>
                                          </>
                                        ) : (
                                          <span className="text-sm font-bold text-purple-700">{formatPrice(design.price)}</span>
                                        )}
                                      </div>
                                      {design.isPremium && (
                                        <Badge variant="secondary" className="mt-1 text-[10px]">Premium</Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <Separator className="my-4" />

                          {/* Customer Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-purple-600" />
                                Delivery Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <p><span className="font-medium text-gray-600">Name:</span> {order.name}</p>
                                <p><span className="font-medium text-gray-600">Email:</span> {order.email}</p>
                                <p><span className="font-medium text-gray-600">Phone:</span> {order.phone}</p>
                                <p><span className="font-medium text-gray-600">Address:</span> {order.address}</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-purple-600" />
                                Payment Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <p><span className="font-medium text-gray-600">Payment ID:</span>
                                  <span className="font-mono text-xs ml-1">{order.razorpayPaymentId || 'N/A'}</span>
                                </p>
                                <p><span className="font-medium text-gray-600">Order ID:</span>
                                  <span className="font-mono text-xs ml-1">{order.razorpayOrderId || 'N/A'}</span>
                                </p>
                                <p><span className="font-medium text-gray-600">Status:</span>
                                  <Badge variant={statusBadge.variant} className="ml-2">{order.status}</Badge>
                                </p>
                              </div>
                            </div>
                          </div>

{/*                           
                          {order.status === 'PAID' || order.status === 'COMPLETED' ? (
                            <div className="mt-6 flex gap-3">
                              <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                                <Download className="w-4 h-4 mr-2" />
                                Download Files
                              </Button>
                              <Button variant="outline">
                                View Details
                              </Button>
                            </div>
                          ) : order.status === 'PENDING' && (
                            <div className="mt-6 flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <p className="text-sm text-yellow-800">Payment pending for this order</p>
                              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                                Complete Payment
                              </Button>
                            </div>
                          )} */}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Product Orders Tab */}
            <TabsContent value="products" className="mt-0">
              {isLoadingProducts ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your product orders...</p>
                </div>
              ) : productOrders.length === 0 ? (
                <Card className="text-center py-16 border-2 border-dashed">
                  <CardContent>
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">No Product Orders Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      You haven't ordered any products yet. Explore our collection of quality products.
                    </p>
                    <Button onClick={() => navigate('/allProductItems')} className="bg-blue-600 hover:bg-blue-700">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Browse Products
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {productOrders.map((order) => {
                    const statusBadge = getProductStatusBadge(order.orderStatus);
                    const StatusIcon = statusBadge.icon;

                    return (
                      <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="font-mono text-xs">
                                  {order.orderId}
                                </Badge>
                                <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                                  <StatusIcon className="w-3 h-3" />
                                  {statusBadge.label}
                                </Badge>
                                {order.paymentStatus === 'PAID' && (
                                  <Badge variant="default" className="bg-green-600">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Paid
                                  </Badge>
                                )}
                              </div>
                              <CardTitle className="text-xl flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-blue-600" />
                                Product Order #{order.id}
                              </CardTitle>
                              <CardDescription className="flex flex-wrap items-center gap-4 mt-3">
                                <span className="flex items-center gap-1.5 text-sm">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(order.orderDate)}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-700">
                                  <CreditCard className="h-4 w-4" />
                                  {formatPrice(order.totalPrice)}
                                </span>
                                {order.trackingNumber && (
                                  <span className="flex items-center gap-1.5 text-sm">
                                    <Truck className="h-4 w-4" />
                                    {order.trackingNumber}
                                  </span>
                                )}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-6">
                          {/* Product Details */}
                          {order.product && (
                            <div className="mb-6">
                              <div className="flex gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
                                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                                  <img
                                    src={getImageUrl(order.product.imageUrls)}
                                    alt={order.product.productName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = '/placeholder.svg';
                                    }}
                                  />
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-semibold text-lg">{order.product.productName}</h5>
                                  <p className="text-sm text-muted-foreground">{order.product.category} • {order.product.subcategory}</p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xs text-gray-600">Color: <span className="font-semibold">{order.selectedColor}</span></span>
                                    <span className="text-xs text-gray-600">Size: <span className="font-semibold">{order.selectedSize}</span></span>
                                    <span className="text-xs text-gray-600">Qty: <span className="font-semibold">{order.quantity}</span></span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-lg font-bold text-blue-700">{formatPrice(order.totalPrice)}</span>
                                    <span className="text-xs text-gray-500">({formatPrice(order.unitPrice)} each)</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <Separator className="my-4" />

                          {/* Shipping & Payment Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                Shipping Address
                              </h4>
                              <div className="space-y-2 text-sm">
                                <p><span className="font-medium text-gray-600">Name:</span> {order.customerName}</p>
                                <p><span className="font-medium text-gray-600">Email:</span> {order.customerEmail}</p>
                                <p><span className="font-medium text-gray-600">Phone:</span> {order.customerPhone}</p>
                                <p><span className="font-medium text-gray-600">Address:</span> {order.shippingAddress}</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                <Truck className="h-4 w-4 text-blue-600" />
                                Order Status
                              </h4>
                              <div className="space-y-2 text-sm">
                                <p><span className="font-medium text-gray-600">Order Status:</span>
                                  <Badge variant={statusBadge.variant} className="ml-2">{statusBadge.label}</Badge>
                                </p>
                                <p><span className="font-medium text-gray-600">Payment Status:</span>
                                  <Badge variant={order.paymentStatus === 'PAID' ? 'default' : 'secondary'} className="ml-2">
                                    {order.paymentStatus}
                                  </Badge>
                                </p>
                                {order.shippedDate && (
                                  <p><span className="font-medium text-gray-600">Shipped:</span> {formatDate(order.shippedDate)}</p>
                                )}
                                {order.deliveredDate && (
                                  <p><span className="font-medium text-gray-600">Delivered:</span> {formatDate(order.deliveredDate)}</p>
                                )}
                                {order.trackingNumber && (
                                  <p><span className="font-medium text-gray-600">Tracking:</span>
                                    <span className="font-mono text-xs ml-1">{order.trackingNumber}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Order Notes */}
                          {order.orderNotes && (
                            <>
                              <Separator className="my-4" />
                              <div>
                                <h4 className="font-semibold text-sm text-gray-700 mb-2">Order Notes</h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{order.orderNotes}</p>
                              </div>
                            </>
                          )}

                          {/* Action Buttons */}
                          {order.orderStatus === 'PENDING' && order.paymentStatus === 'PENDING' && (
                            <div className="mt-6 flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <p className="text-sm text-yellow-800">Payment pending for this order</p>
                              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                                Pay Now
                              </Button>
                            </div>
                          )}

                          {order.orderStatus === 'SHIPPED' && (
                            <div className="mt-6">
                              <Button variant="outline" className="w-full">
                                <Truck className="w-4 h-4 mr-2" />
                                Track Shipment
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
