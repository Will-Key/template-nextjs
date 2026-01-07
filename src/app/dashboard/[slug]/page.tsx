"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { OrderWithDetails } from "@/lib/types/order";
import { OrderStatus } from "@prisma/client";
import {
  formatPrice,
  getOrderStatusLabel,
  getOrderStatusColor,
} from "@/lib/order-utils";
import { useStaffAuth } from "@/lib/staff-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Clock,
  CheckCircle,
  ChefHat,
  Bell,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

type PageParams = { slug: string };

export default function DashboardPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { staff, isLoading: authLoading, isAuthenticated, authFetch } = useStaffAuth();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // Redirection si non authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Vérifier que le staff a accès à ce restaurant
  useEffect(() => {
    if (staff && staff.restaurant.slug !== slug) {
      toast.error("Vous n'avez pas accès à ce restaurant");
      router.push(`/dashboard/${staff.restaurant.slug}`);
    }
  }, [staff, slug, router]);

  const fetchOrders = async () => {
    if (!restaurantId) return;
    
    try {
      const response = await authFetch(
        `/api/orders?restaurantId=${restaurantId}&status=pending,confirmed,preparing,ready`
      );
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setOrders([]);
    }
  };

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const response = await authFetch(`/api/restaurants/${slug}`);
        if (!response.ok) throw new Error("Restaurant non trouvé");
        const data = await response.json();
        setRestaurantId(data.id);
      } catch (error) {
        console.error(error);
        toast.error("Restaurant non trouvé");
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurant();
  }, [slug]);

  useEffect(() => {
    if (restaurantId) {
      fetchOrders();
      // Polling toutes les 5 secondes
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId);
    try {
      const response = await authFetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      toast.success(`Commande ${getOrderStatusLabel(newStatus).toLowerCase()}`);
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error("Impossible de mettre à jour la commande");
    } finally {
      setUpdating(null);
    }
  };

  const getOrdersByStatus = (status: OrderStatus | OrderStatus[]) => {
    const statuses = Array.isArray(status) ? status : [status];
    return orders.filter((order) => statuses.includes(order.status));
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Ne pas rendre si non authentifié
  if (!isAuthenticated || !staff) {
    return null;
  }

  const pendingOrders = getOrdersByStatus("pending");
  const confirmedOrders = getOrdersByStatus("confirmed");
  const preparingOrders = getOrdersByStatus("preparing");
  const readyOrders = getOrdersByStatus("ready");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-30">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="ml-10 md:ml-0">
            <h1 className="text-xl font-bold">Commandes</h1>
            <p className="text-sm text-muted-foreground">Gérer les commandes en cours</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </header>

      <main className="px-4 md:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{pendingOrders.length}</p>
                  <p className="text-xs text-muted-foreground">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{confirmedOrders.length}</p>
                  <p className="text-xs text-muted-foreground">Confirmées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{preparingOrders.length}</p>
                  <p className="text-xs text-muted-foreground">En cuisine</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{readyOrders.length}</p>
                  <p className="text-xs text-muted-foreground">Prêtes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Tabs */}
        <Tabs defaultValue="pending">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="pending" className="relative">
              En attente
              {pendingOrders.length > 0 && (
                <Badge className="ml-2 bg-yellow-500">{pendingOrders.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmées
              {confirmedOrders.length > 0 && (
                <Badge className="ml-2 bg-blue-500">{confirmedOrders.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preparing">
              En cuisine
              {preparingOrders.length > 0 && (
                <Badge className="ml-2 bg-orange-500">{preparingOrders.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ready">
              Prêtes
              {readyOrders.length > 0 && (
                <Badge className="ml-2 bg-green-500">{readyOrders.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <OrderList
              orders={pendingOrders}
              onConfirm={(id) => updateOrderStatus(id, "confirmed")}
              onCancel={(id) => updateOrderStatus(id, "cancelled")}
              updating={updating}
              actionLabel="Confirmer"
              actionIcon={<CheckCircle className="h-4 w-4 mr-1" />}
            />
          </TabsContent>

          <TabsContent value="confirmed" className="mt-4">
            <OrderList
              orders={confirmedOrders}
              onConfirm={(id) => updateOrderStatus(id, "preparing")}
              onCancel={(id) => updateOrderStatus(id, "cancelled")}
              updating={updating}
              actionLabel="En cuisine"
              actionIcon={<ChefHat className="h-4 w-4 mr-1" />}
            />
          </TabsContent>

          <TabsContent value="preparing" className="mt-4">
            <OrderList
              orders={preparingOrders}
              onConfirm={(id) => updateOrderStatus(id, "ready")}
              updating={updating}
              actionLabel="Prête"
              actionIcon={<Bell className="h-4 w-4 mr-1" />}
            />
          </TabsContent>

          <TabsContent value="ready" className="mt-4">
            <OrderList
              orders={readyOrders}
              onConfirm={(id) => updateOrderStatus(id, "served")}
              updating={updating}
              actionLabel="Servie"
              actionIcon={<CheckCircle className="h-4 w-4 mr-1" />}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function OrderList({
  orders,
  onConfirm,
  onCancel,
  updating,
  actionLabel,
  actionIcon,
}: {
  orders: OrderWithDetails[];
  onConfirm: (id: string) => void;
  onCancel?: (id: string) => void;
  updating: string | null;
  actionLabel: string;
  actionIcon: React.ReactNode;
}) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucune commande
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <Card key={order.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
              <Badge className={getOrderStatusColor(order.status)}>
                {getOrderStatusLabel(order.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Table {order.table.number}</span>
              <span>•</span>
              <span>
                {new Date(order.createdAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Items */}
            <div className="space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    <strong>{item.quantity}x</strong> {item.menuItem.name}
                  </span>
                  <span className="text-muted-foreground">
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                📝 {order.notes}
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                onClick={() => onConfirm(order.id)}
                disabled={updating === order.id}
              >
                {updating === order.id ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  actionIcon
                )}
                {actionLabel}
              </Button>
              {onCancel && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onCancel(order.id)}
                  disabled={updating === order.id}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
