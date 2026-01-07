"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useStaffAuth } from "@/lib/staff-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Save,
  Store,
  MapPin,
  Phone,
  Clock,
  Palette,
} from "lucide-react";
import { toast } from "sonner";

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo: string | null;
  coverImage: string | null;
  openingHours: any;
  isActive: boolean;
  currency: string;
  taxRate: number;
};

type PageParams = { slug: string };

export default function SettingsPage({ params }: { params: Promise<PageParams> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { staff, isLoading: authLoading, isAuthenticated } = useStaffAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    currency: "XOF",
    taxRate: "0",
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Only owner can access this page
  useEffect(() => {
    if (staff && staff.role !== "owner") {
      toast.error("Accès réservé au propriétaire");
      router.push(`/dashboard/${slug}`);
    }
  }, [staff, slug, router]);

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const response = await fetch(`/api/restaurants/${slug}`);
        if (!response.ok) throw new Error("Restaurant non trouvé");
        const data = await response.json();
        setRestaurant(data);
        setForm({
          name: data.name || "",
          description: data.description || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          currency: data.currency || "XOF",
          taxRate: String(data.taxRate || 0),
          isActive: data.isActive ?? true,
        });
      } catch (error) {
        console.error(error);
        toast.error("Restaurant non trouvé");
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurant();
  }, [slug]);

  const saveSettings = async () => {
    if (!form.name.trim()) {
      toast.error("Le nom du restaurant est requis");
      return;
    }

    if (!restaurant) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/restaurants/${restaurant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          address: form.address || null,
          phone: form.phone || null,
          email: form.email || null,
          currency: form.currency,
          taxRate: parseFloat(form.taxRate) || 0,
          isActive: form.isActive,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur");
      }

      toast.success("Paramètres enregistrés");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !staff || !restaurant) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-30">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="ml-10 md:ml-0">
            <h1 className="text-xl font-bold">Paramètres</h1>
            <p className="text-sm text-muted-foreground">
              Configurer votre restaurant
            </p>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Enregistrer
          </Button>
        </div>
      </header>

      <main className="px-4 md:px-6 py-6 max-w-3xl space-y-6">
        {/* General Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Informations générales
            </CardTitle>
            <CardDescription>
              Les informations de base de votre restaurant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du restaurant *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Mon Restaurant"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Une courte description de votre restaurant..."
                rows={3}
              />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input value={restaurant.slug} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">
                L'URL de votre restaurant ne peut pas être modifiée
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Contact & Localisation
            </CardTitle>
            <CardDescription>
              Comment vos clients peuvent vous contacter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="123 Rue du Restaurant, Abidjan"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+225 07 00 00 00 00"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@restaurant.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Paramètres métier
            </CardTitle>
            <CardDescription>
              Configuration des tarifs et taxes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Devise</Label>
                <Input
                  id="currency"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  placeholder="XOF"
                />
              </div>
              <div>
                <Label htmlFor="taxRate">Taux de TVA (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Statut du restaurant</CardTitle>
            <CardDescription>
              Activer ou désactiver la prise de commandes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Restaurant actif</p>
                <p className="text-sm text-muted-foreground">
                  {form.isActive
                    ? "Les clients peuvent passer commande"
                    : "Les commandes sont désactivées"}
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Zone de danger</CardTitle>
            <CardDescription>
              Actions irréversibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Supprimer le restaurant</p>
                <p className="text-sm text-muted-foreground">
                  Cette action supprimera toutes les données
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => toast.error("Fonctionnalité non disponible")}
              >
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
