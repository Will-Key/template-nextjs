"use client";

import { useEffect, useState, use } from "react";
import { useCart } from "@/lib/cart-context";
import { RestaurantWithMenu, MenuItem } from "@/lib/types/order";
import { formatPrice } from "@/lib/order-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Loader2,
  Leaf,
  Flame,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type PageParams = { slug: string; tableNumber: string };

export default function MenuPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug, tableNumber } = use(params);
  const router = useRouter();
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart,
    setTableInfo,
    totalItems,
    subtotal,
  } = useCart();

  const [restaurant, setRestaurant] = useState<RestaurantWithMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemNotes, setItemNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const response = await fetch(`/api/restaurants/${slug}`);
        if (!response.ok) throw new Error("Restaurant non trouvé");
        const data = await response.json();
        setRestaurant(data);

        // Trouver la table correspondante
        const table = data.tables.find(
          (t: { number: number }) => t.number === parseInt(tableNumber)
        );
        if (table) {
          setTableInfo(data.id, table.id);
        }

        // Définir la première catégorie comme active
        if (data.categories.length > 0) {
          setActiveCategory(data.categories[0].id);
        }
      } catch (error) {
        console.error(error);
        toast.error("Impossible de charger le menu");
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurant();
  }, [slug, tableNumber, setTableInfo]);

  const handleAddToCart = (item: MenuItem) => {
    addItem(item, 1, itemNotes);
    setSelectedItem(null);
    setItemNotes("");
    toast.success(`${item.name} ajouté au panier`);
  };

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    const table = restaurant?.tables.find(
      (t) => t.number === parseInt(tableNumber)
    );

    if (!restaurant || !table) {
      toast.error("Erreur de configuration");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          tableId: table.id,
          items: items.map((item) => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
            notes: item.notes,
          })),
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la commande");

      const order = await response.json();
      clearCart();
      toast.success("Commande envoyée !");
      router.push(`/r/${slug}/order/${order.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Impossible d'envoyer la commande");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Restaurant non trouvé</p>
      </div>
    );
  }

  const getCartItem = (menuItemId: string) =>
    items.find((item) => item.menuItem.id === menuItemId);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b">
        {restaurant.coverImage && (
          <div className="h-32 relative">
            <Image
              src={restaurant.coverImage}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-3">
            {restaurant.logo && (
              <Image
                src={restaurant.logo}
                alt={restaurant.name}
                width={48}
                height={48}
                className="rounded-full"
              />
            )}
            <div>
              <h1 className="text-xl font-bold">{restaurant.name}</h1>
              <p className="text-sm text-muted-foreground">
                Table {tableNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Catégories */}
        <div className="flex overflow-x-auto gap-2 px-4 pb-3 scrollbar-hide">
          {restaurant.categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-6">
        {restaurant.categories
          .filter((cat) => !activeCategory || cat.id === activeCategory)
          .map((category) => (
            <div key={category.id}>
              <h2 className="text-lg font-semibold mb-3">{category.name}</h2>
              <div className="space-y-3">
                {category.menuItems.map((item) => {
                  const cartItem = getCartItem(item.id);
                  return (
                    <Card
                      key={item.id}
                      className="overflow-hidden"
                      onClick={() => setSelectedItem(item)}
                    >
                      <CardContent className="p-0">
                        <div className="flex">
                          <div className="flex-1 p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium">{item.name}</h3>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {item.isVegetarian && (
                                <Badge variant="secondary" className="text-xs">
                                  <Leaf className="h-3 w-3 mr-1" /> Végé
                                </Badge>
                              )}
                              {item.isSpicy && (
                                <Badge variant="destructive" className="text-xs">
                                  <Flame className="h-3 w-3 mr-1" /> Épicé
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-semibold">
                                {formatPrice(item.price, restaurant.currency)}
                              </span>
                              {cartItem ? (
                                <div
                                  className="flex items-center gap-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      updateQuantity(
                                        item.id,
                                        cartItem.quantity - 1
                                      )
                                    }
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-6 text-center">
                                    {cartItem.quantity}
                                  </span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      updateQuantity(
                                        item.id,
                                        cartItem.quantity + 1
                                      )
                                    }
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addItem(item);
                                    toast.success(`${item.name} ajouté`);
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                                </Button>
                              )}
                            </div>
                          </div>
                          {item.image && (
                            <div className="w-24 h-24 relative flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      {/* Item Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {selectedItem.image && (
                <div className="relative h-48 rounded-lg overflow-hidden">
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <p className="text-muted-foreground">{selectedItem.description}</p>

              {selectedItem.allergens.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Allergènes</p>
                    <p className="text-sm text-yellow-700">
                      {selectedItem.allergens.join(", ")}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">
                  Instructions spéciales (optionnel)
                </label>
                <Textarea
                  placeholder="Ex: sans oignons, bien cuit..."
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-bold">
                  {formatPrice(selectedItem.price, restaurant?.currency)}
                </span>
                <Button onClick={() => handleAddToCart(selectedItem)}>
                  Ajouter au panier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Button (Fixed) */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="w-full" size="lg">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Voir le panier ({totalItems}) •{" "}
                {formatPrice(subtotal, restaurant.currency)}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Votre panier</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    {item.menuItem.image && (
                      <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {item.menuItem.name}
                      </h4>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.notes}
                        </p>
                      )}
                      <p className="text-sm font-semibold">
                        {formatPrice(
                          item.menuItem.price * item.quantity,
                          restaurant.currency
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.menuItem.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.menuItem.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeItem(item.menuItem.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(subtotal, restaurant.currency)}</span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Confirmer la commande"
                  )}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
}
