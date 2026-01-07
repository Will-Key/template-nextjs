"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { OrderWithDetails } from "@/lib/types/order";
import { formatPrice, getOrderStatusLabel, getOrderStatusColor } from "@/lib/order-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, CheckCircle2, ChefHat, Bell, Plus } from "lucide-react";
import Image from "next/image";

type PageParams = { slug: string; orderId: string };

export default function OrderStatusPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug, orderId } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) throw new Error("Commande non trouvée");
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();

    // Polling pour les mises à jour de statut (toutes les 10 secondes)
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Commande non trouvée</p>
      </div>
    );
  }

  const statusSteps = [
    { status: "pending", label: "En attente", icon: Clock },
    { status: "confirmed", label: "Confirmée", icon: CheckCircle2 },
    { status: "preparing", label: "En préparation", icon: ChefHat },
    { status: "ready", label: "Prête", icon: Bell },
  ];

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.status === order.status
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">Commande {order.orderNumber}</h1>
          <p className="text-muted-foreground">
            Table {order.table.number}
            {order.table.name && ` - ${order.table.name}`}
          </p>
        </div>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Statut</span>
              <Badge className={getOrderStatusColor(order.status)}>
                {getOrderStatusLabel(order.status)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Status Progress */}
            {order.status !== "cancelled" && order.status !== "completed" && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index <= currentStepIndex;
                    const isCurrent = step.status === order.status;

                    return (
                      <div
                        key={step.status}
                        className={`flex flex-col items-center ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs mt-1 text-center">
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-primary transition-all duration-500"
                    style={{
                      width: `${((currentStepIndex + 1) / statusSteps.length) * 100}%`,
                    }}
                  />
                </div>

                {order.status === "ready" && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <Bell className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <p className="font-semibold text-green-800">
                      Votre commande est prête !
                    </p>
                    <p className="text-sm text-green-700">
                      Vous pouvez venir la récupérer au comptoir.
                    </p>
                  </div>
                )}

                {order.estimatedPrepTime && order.status === "preparing" && (
                  <p className="text-center text-muted-foreground">
                    Temps estimé : ~{order.estimatedPrepTime} min
                  </p>
                )}
              </div>
            )}

            {order.status === "cancelled" && (
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-red-800 font-medium">
                  Cette commande a été annulée.
                </p>
              </div>
            )}

            {order.status === "completed" && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <CheckCircle2 className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                <p className="text-gray-800 font-medium">
                  Merci pour votre commande !
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Détail de la commande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 pb-3 border-b last:border-0"
              >
                {item.menuItem.image && (
                  <div className="w-12 h-12 relative rounded overflow-hidden shrink-0">
                    <Image
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {item.quantity}x {item.menuItem.name}
                    </span>
                    <span>
                      {formatPrice(item.totalPrice, order.restaurant.currency)}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-muted-foreground">{item.notes}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-3 space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Sous-total</span>
                <span>
                  {formatPrice(order.subtotal, order.restaurant.currency)}
                </span>
              </div>
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes</span>
                  <span>
                    {formatPrice(order.taxAmount, order.restaurant.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>
                  {formatPrice(order.total, order.restaurant.currency)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {order.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Bouton nouvelle commande */}
        <div className="pt-4 pb-8">
          <Button
            className="w-full"
            size="lg"
            onClick={() => router.push(`/r/${slug}/table/${order.table.number}`)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Passer une nouvelle commande
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Vous pouvez commander d'autres articles pour votre table
          </p>
        </div>
      </div>
    </div>
  );
}
