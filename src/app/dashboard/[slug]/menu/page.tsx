"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useStaffAuth } from "@/lib/staff-auth-context";
import { formatPrice } from "@/lib/order-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  UtensilsCrossed,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

type MenuCategory = {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  menuItems: MenuItem[];
};

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  status: string;
  categoryId: string;
};

type PageParams = { slug: string };

export default function MenuPage({ params }: { params: Promise<PageParams> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { staff, isLoading: authLoading, isAuthenticated, authFetch } = useStaffAuth();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Category dialog state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [savingCategory, setSavingCategory] = useState(false);

  // Item dialog state
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    status: "available",
  });
  const [savingItem, setSavingItem] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

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
      }
    }
    fetchRestaurant();
  }, [slug, authFetch]);

  const fetchCategories = async () => {
    if (!restaurantId) return;
    try {
      const response = await authFetch(`/api/menu/categories?restaurantId=${restaurantId}`);
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchCategories();
    }
  }, [restaurantId]);

  // Category handlers
  const openCategoryDialog = (category?: MenuCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, description: category.description || "" });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "" });
    }
    setCategoryDialogOpen(true);
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }

    setSavingCategory(true);
    try {
      const url = editingCategory
        ? `/api/menu/categories/${editingCategory.id}`
        : "/api/menu/categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...categoryForm,
          restaurantId,
          sortOrder: editingCategory?.sortOrder || categories.length,
        }),
      });

      if (!response.ok) throw new Error("Erreur");

      toast.success(editingCategory ? "Catégorie modifiée" : "Catégorie créée");
      setCategoryDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSavingCategory(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Supprimer cette catégorie et tous ses plats ?")) return;

    try {
      const response = await authFetch(`/api/menu/categories/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erreur");
      toast.success("Catégorie supprimée");
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Item handlers
  const openItemDialog = (categoryId?: string, item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        description: item.description || "",
        price: String(item.price),
        categoryId: item.categoryId,
        status: item.status,
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: "",
        description: "",
        price: "",
        categoryId: categoryId || "",
        status: "available",
      });
    }
    setItemDialogOpen(true);
  };

  const saveItem = async () => {
    if (!itemForm.name.trim() || !itemForm.price || !itemForm.categoryId) {
      toast.error("Nom, prix et catégorie sont requis");
      return;
    }

    setSavingItem(true);
    try {
      const url = editingItem
        ? `/api/menu/items/${editingItem.id}`
        : "/api/menu/items";
      const method = editingItem ? "PUT" : "POST";

      const response = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...itemForm,
          price: parseFloat(itemForm.price),
        }),
      });

      if (!response.ok) throw new Error("Erreur");

      toast.success(editingItem ? "Plat modifié" : "Plat créé");
      setItemDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSavingItem(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Supprimer ce plat ?")) return;

    try {
      const response = await authFetch(`/api/menu/items/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erreur");
      toast.success("Plat supprimé");
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const toggleItemStatus = async (item: MenuItem) => {
    const newStatus = item.status === "available" ? "unavailable" : "available";
    try {
      const response = await authFetch(`/api/menu/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Erreur");
      toast.success(`Plat ${newStatus === "available" ? "disponible" : "indisponible"}`);
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !staff) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-30">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="ml-10 md:ml-0">
            <h1 className="text-xl font-bold">Menu</h1>
            <p className="text-sm text-muted-foreground">
              Gérer les catégories et les plats
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => openCategoryDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Catégorie
            </Button>
            <Button onClick={() => openItemDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Plat
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-6 py-6 space-y-6">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune catégorie</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par créer des catégories pour organiser votre menu
              </p>
              <Button onClick={() => openCategoryDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une catégorie
              </Button>
            </CardContent>
          </Card>
        ) : (
          categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openItemDialog(category.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openCategoryDialog(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => deleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {category.description && (
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {category.menuItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun plat dans cette catégorie
                  </p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {category.menuItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          item.status !== "available" ? "opacity-60 bg-muted/50" : ""
                        }`}
                      >
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover rounded-lg"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium truncate">{item.name}</h4>
                              <p className="text-sm font-semibold text-orange-600">
                                {formatPrice(item.price)}
                              </p>
                            </div>
                            <Badge
                              variant={item.status === "available" ? "default" : "secondary"}
                              className="cursor-pointer shrink-0"
                              onClick={() => toggleItemStatus(item)}
                            >
                              {item.status === "available" ? "Dispo" : "Indispo"}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {item.description}
                            </p>
                          )}
                          <div className="flex gap-1 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => openItemDialog(category.id, item)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-red-600"
                              onClick={() => deleteItem(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </main>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </DialogTitle>
            <DialogDescription>
              Les catégories permettent d'organiser votre menu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Nom *</Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                placeholder="Ex: Entrées, Plats, Desserts..."
              />
            </div>
            <div>
              <Label htmlFor="categoryDesc">Description</Label>
              <Textarea
                id="categoryDesc"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, description: e.target.value })
                }
                placeholder="Description optionnelle"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveCategory} disabled={savingCategory}>
              {savingCategory && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingCategory ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Modifier le plat" : "Nouveau plat"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="itemName">Nom *</Label>
              <Input
                id="itemName"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="Nom du plat"
              />
            </div>
            <div>
              <Label htmlFor="itemDesc">Description</Label>
              <Textarea
                id="itemDesc"
                value={itemForm.description}
                onChange={(e) =>
                  setItemForm({ ...itemForm, description: e.target.value })
                }
                placeholder="Description du plat"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemPrice">Prix (FCFA) *</Label>
                <Input
                  id="itemPrice"
                  type="number"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="itemCategory">Catégorie *</Label>
                <Select
                  value={itemForm.categoryId}
                  onValueChange={(value) =>
                    setItemForm({ ...itemForm, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="itemStatus">Statut</Label>
              <Select
                value={itemForm.status}
                onValueChange={(value) => setItemForm({ ...itemForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="unavailable">Indisponible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveItem} disabled={savingItem}>
              {savingItem && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
