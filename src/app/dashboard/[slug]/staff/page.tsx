"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useStaffAuth } from "@/lib/staff-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Users,
  Shield,
  ChefHat,
  CreditCard,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

type Staff = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
};

type PageParams = { slug: string };

export default function StaffPage({ params }: { params: Promise<PageParams> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { staff: currentStaff, isLoading: authLoading, isAuthenticated, authFetch } = useStaffAuth();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "waiter",
    password: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Only owner can access this page
  useEffect(() => {
    if (currentStaff && currentStaff.role !== "owner") {
      toast.error("Accès réservé au propriétaire");
      router.push(`/dashboard/${slug}`);
    }
  }, [currentStaff, slug, router]);

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

  const fetchStaff = async () => {
    if (!restaurantId) return;
    try {
      const response = await authFetch(`/api/staff?restaurantId=${restaurantId}`);
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setStaffList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchStaff();
    }
  }, [restaurantId]);

  const openDialog = (staff?: Staff) => {
    if (staff) {
      setEditingStaff(staff);
      setForm({
        name: staff.name,
        email: staff.email,
        phone: staff.phone || "",
        role: staff.role,
        password: "",
        isActive: staff.isActive,
      });
    } else {
      setEditingStaff(null);
      setForm({
        name: "",
        email: "",
        phone: "",
        role: "waiter",
        password: "",
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const saveStaff = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Nom et email sont requis");
      return;
    }

    if (!editingStaff && !form.password) {
      toast.error("Le mot de passe est requis pour un nouveau membre");
      return;
    }

    setSaving(true);
    try {
      const url = editingStaff ? `/api/staff/${editingStaff.id}` : "/api/staff";
      const method = editingStaff ? "PUT" : "POST";

      const body: any = {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        role: form.role,
        isActive: form.isActive,
        restaurantId,
      };

      if (form.password) {
        body.password = form.password;
      }

      const response = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur");
      }

      toast.success(editingStaff ? "Membre modifié" : "Membre créé");
      setDialogOpen(false);
      fetchStaff();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const deleteStaff = async (id: string, name: string) => {
    if (id === currentStaff?.id) {
      toast.error("Vous ne pouvez pas vous supprimer vous-même");
      return;
    }

    if (!confirm(`Supprimer ${name} du personnel ?`)) return;

    try {
      const response = await authFetch(`/api/staff/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erreur");
      toast.success("Membre supprimé");
      fetchStaff();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const toggleActive = async (staff: Staff) => {
    if (staff.id === currentStaff?.id) {
      toast.error("Vous ne pouvez pas vous désactiver vous-même");
      return;
    }

    try {
      const response = await authFetch(`/api/staff/${staff.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !staff.isActive }),
      });
      if (!response.ok) throw new Error("Erreur");
      toast.success(staff.isActive ? "Membre désactivé" : "Membre activé");
      fetchStaff();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Shield className="h-4 w-4" />;
      case "cashier":
        return <CreditCard className="h-4 w-4" />;
      case "kitchen":
        return <ChefHat className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Propriétaire";
      case "cashier":
        return "Caissier";
      case "waiter":
        return "Serveur";
      case "kitchen":
        return "Cuisine";
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "cashier":
        return "bg-blue-100 text-blue-800";
      case "kitchen":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !currentStaff) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-30">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="ml-10 md:ml-0">
            <h1 className="text-xl font-bold">Personnel</h1>
            <p className="text-sm text-muted-foreground">
              {staffList.length} membre{staffList.length > 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </header>

      <main className="px-4 md:px-6 py-6">
        {staffList.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun personnel</h3>
              <p className="text-muted-foreground mb-4">
                Ajoutez des membres du personnel pour gérer votre restaurant
              </p>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un membre
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {staffList.map((staff) => (
              <Card
                key={staff.id}
                className={`${!staff.isActive ? "opacity-60" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={getRoleColor(staff.role)}>
                        {staff.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{staff.name}</h3>
                        {staff.id === currentStaff.id && (
                          <Badge variant="outline" className="text-xs">Vous</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getRoleColor(staff.role)} flex items-center gap-1`}>
                          {getRoleIcon(staff.role)}
                          {getRoleLabel(staff.role)}
                        </Badge>
                        {!staff.isActive && (
                          <Badge variant="secondary">Inactif</Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{staff.email}</span>
                        </div>
                        {staff.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>{staff.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {staff.id !== currentStaff.id && (
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(staff)}
                      >
                        {staff.isActive ? "Désactiver" : "Activer"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(staff)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => deleteStaff(staff.id, staff.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? `Modifier ${editingStaff.name}` : "Nouveau membre"}
            </DialogTitle>
            <DialogDescription>
              {editingStaff
                ? "Modifiez les informations du membre"
                : "Ajoutez un nouveau membre au personnel"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="staffName">Nom complet *</Label>
              <Input
                id="staffName"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <Label htmlFor="staffEmail">Email *</Label>
              <Input
                id="staffEmail"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jean@restaurant.com"
              />
            </div>
            <div>
              <Label htmlFor="staffPhone">Téléphone</Label>
              <Input
                id="staffPhone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+225 07 00 00 00 00"
              />
            </div>
            <div>
              <Label htmlFor="staffRole">Rôle *</Label>
              <Select
                value={form.role}
                onValueChange={(value) => setForm({ ...form, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Propriétaire</SelectItem>
                  <SelectItem value="cashier">Caissier</SelectItem>
                  <SelectItem value="waiter">Serveur</SelectItem>
                  <SelectItem value="kitchen">Cuisine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="staffPassword">
                Mot de passe {editingStaff ? "(laisser vide pour ne pas modifier)" : "*"}
              </Label>
              <Input
                id="staffPassword"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editingStaff ? "••••••••" : "Mot de passe"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveStaff} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingStaff ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
