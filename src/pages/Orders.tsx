import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Package, Calendar, CreditCard, MapPin } from 'lucide-react';

interface Order {
  id: number;
  userUid: string;
  designId?: number;
  productId?: number;
  quantity: number;
  totalAmount: number;
  contactDetails: string;
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt?: string;
}

const Orders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

    fetchOrders();
  }, [user, navigate, toast]);

  const fetchOrders = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Try to fetch from backend
      const response = await fetch(`https://963392021b17.ngrok-free.app/api/orders/user/${user.uid}`, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      console.log(user.uid);

      if (response.ok) {
        const backendOrders = await response.json();
        setOrders(backendOrders);
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      console.error('Error fetching orders from backend:', error);
      
      // Fallback to localStorage
      const localOrders = localStorage.getItem('patternbank_orders');
      if (localOrders) {
        const allOrders: Order[] = JSON.parse(localOrders);
        const userOrders = allOrders.filter(order => order.userUid === user.uid);
        setOrders(userOrders);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'FAILED':
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseContactDetails = (contactDetailsJson: string) => {
    try {
      return JSON.parse(contactDetailsJson);
    } catch {
      return {};
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">My Orders</h1>
              <p className="text-muted-foreground mt-1 md:mt-2">
                Track and manage your order history
              </p>
            </div>
            <Button onClick={() => navigate('/items')} variant="outline" className="self-start sm:self-auto">
              Continue Shopping
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't placed any orders yet. Start shopping to see your orders here.
                </p>
                <Button onClick={() => navigate('/items')}>
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const contactDetails = parseContactDetails(order.contactDetails);
                
                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            Order #{order.id}
                          </CardTitle>
                          <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(order.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <CreditCard className="h-4 w-4" />
                              ${order.totalAmount.toFixed(2)}
                            </span>
                          </CardDescription>
                        </div>
                        <Badge variant={getStatusBadgeVariant(order.status)} className="self-start">
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Order Details</h4>
                          <div className="text-sm space-y-1">
                            <p><span className="font-medium">Quantity:</span> {order.quantity}</p>
                            <p><span className="font-medium">Type:</span> {order.designId ? 'Design' : 'Product'}</p>
                            <p><span className="font-medium">ID:</span> {order.designId || order.productId}</p>
                            {order.razorpayOrderId && (
                              <p><span className="font-medium">Payment ID:</span> {order.razorpayOrderId}</p>
                            )}
                          </div>
                        </div>
                        
                        {contactDetails.name && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              Delivery Details
                            </h4>
                            <div className="text-sm space-y-1">
                              <p><span className="font-medium">Name:</span> {contactDetails.name}</p>
                              <p><span className="font-medium">Email:</span> {contactDetails.email}</p>
                              <p><span className="font-medium">Phone:</span> {contactDetails.phone}</p>
                              {contactDetails.address && (
                                <p><span className="font-medium">Address:</span> {contactDetails.address}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {order.status === 'PENDING' && (
                        <>
                          <Separator />
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <p className="text-sm text-muted-foreground">
                              This order is awaiting payment
                            </p>
                            <Button size="sm" className="self-start sm:self-auto">
                              Pay Now
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;