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
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  LayoutGrid,
  Users,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";

type Table = {
  id: string;
  number: number;
  capacity: number;
  status: string;
  qrCode: string | null;
};

type PageParams = { slug: string };

export default function TablesPage({ params }: { params: Promise<PageParams> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { staff, isLoading: authLoading, isAuthenticated, authFetch } = useStaffAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [form, setForm] = useState({ number: "", capacity: "4", status: "available" });
  const [saving, setSaving] = useState(false);

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

  const fetchTables = async () => {
    if (!restaurantId) return;
    try {
      const response = await authFetch(`/api/tables?restaurantId=${restaurantId}`);
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setTables(Array.isArray(data) ? data.sort((a: Table, b: Table) => a.number - b.number) : []);
    } catch (error) {
      console.error(error);
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchTables();
    }
  }, [restaurantId]);

  const openDialog = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setForm({
        number: String(table.number),
        capacity: String(table.capacity),
        status: table.status,
      });
    } else {
      setEditingTable(null);
      const nextNumber = tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1;
      setForm({ number: String(nextNumber), capacity: "4", status: "available" });
    }
    setDialogOpen(true);
  };

  const saveTable = async () => {
    if (!form.number || !form.capacity) {
      toast.error("Numéro et capacité sont requis");
      return;
    }

    setSaving(true);
    try {
      const url = editingTable ? `/api/tables/${editingTable.id}` : "/api/tables";
      const method = editingTable ? "PUT" : "POST";

      const response = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: parseInt(form.number),
          capacity: parseInt(form.capacity),
          status: form.status,
          restaurantId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur");
      }

      toast.success(editingTable ? "Table modifiée" : "Table créée");
      setDialogOpen(false);
      fetchTables();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const deleteTable = async (id: string) => {
    if (!confirm("Supprimer cette table ?")) return;

    try {
      const response = await authFetch(`/api/tables/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erreur");
      toast.success("Table supprimée");
      fetchTables();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const updateStatus = async (table: Table, newStatus: string) => {
    try {
      const response = await authFetch(`/api/tables/${table.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Erreur");
      toast.success("Statut mis à jour");
      fetchTables();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "occupied":
        return "bg-red-100 text-red-800 border-red-200";
      case "reserved":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Disponible";
      case "occupied":
        return "Occupée";
      case "reserved":
        return "Réservée";
      default:
        return status;
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

  const availableTables = tables.filter((t) => t.status === "available").length;
  const occupiedTables = tables.filter((t) => t.status === "occupied").length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-30">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="ml-10 md:ml-0">
            <h1 className="text-xl font-bold">Tables</h1>
            <p className="text-sm text-muted-foreground">
              {availableTables} disponibles • {occupiedTables} occupées
            </p>
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une table
          </Button>
        </div>
      </header>

      <main className="px-4 md:px-6 py-6">
        {tables.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <LayoutGrid className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune table</h3>
              <p className="text-muted-foreground mb-4">
                Ajoutez des tables pour que les clients puissent passer commande
              </p>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une table
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {tables.map((table) => (
              <Card
                key={table.id}
                className={`relative overflow-hidden transition-all hover:shadow-md ${
                  table.status === "occupied" ? "ring-2 ring-red-200" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold">#{table.number}</span>
                    <Badge className={getStatusColor(table.status)}>
                      {getStatusLabel(table.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <Users className="h-4 w-4" />
                    <span>{table.capacity} places</span>
                  </div>

                  {/* Status buttons */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {table.status !== "available" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => updateStatus(table, "available")}
                      >
                        Libérer
                      </Button>
                    )}
                    {table.status !== "occupied" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => updateStatus(table, "occupied")}
                      >
                        Occuper
                      </Button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => router.push(`/dashboard/${slug}/qrcodes?table=${table.number}`)}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => openDialog(table)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-red-600"
                        onClick={() => deleteTable(table.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
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
              {editingTable ? `Modifier la table #${editingTable.number}` : "Nouvelle table"}
            </DialogTitle>
            <DialogDescription>
              Configurez les paramètres de la table
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tableNumber">Numéro *</Label>
                <Input
                  id="tableNumber"
                  type="number"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="tableCapacity">Capacité *</Label>
                <Input
                  id="tableCapacity"
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  placeholder="4"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tableStatus">Statut</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="occupied">Occupée</SelectItem>
                  <SelectItem value="reserved">Réservée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveTable} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingTable ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
