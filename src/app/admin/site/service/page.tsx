"use client";

import { useEffect, useState } from "react";
import AppHeader from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ServiceForm } from "./ServiceForm";
import { Service } from "./model";
import DataList from "@/components/ui/data-list";

export default function Page() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err instanceof Error ? err : new Error("Une erreur est survenue")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (service: Service | null = null) => {
    setServiceToEdit(service);
    setOpen(true);
  };

  const handleSuccess = () => {
    setOpen(false);
    fetchServices();
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div>
      <AppHeader parent="Site" child="Services" />
      <div className="mt-4 p-5 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Services</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm(null)}>
              Créer un service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {serviceToEdit ? "Modifier" : "Créer"} un service
              </DialogTitle>
            </DialogHeader>
            <ServiceForm
              service={serviceToEdit}
              onClose={() => setOpen(false)}
              onSuccess={handleSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>
      {/* <ServiceList
        services={services}
        onEdit={(service) => handleOpenForm(service)}
        onSuccess={handleSuccess}
        loading={loading}
        error={error}
        loadData={fetchServices}
      /> */}
      <DataList
        data={services}
        loading={loading}
        error={error}
        onEdit={(elt) => handleOpenForm(elt)}
        onSuccess={fetchServices}
        loadData={fetchServices}
        titleField="label" // Utilise "label" au lieu de "title"
        config={{
          messages: {
            loading: "Chargement des données...",
            error: "Une erreur est survenue lors du chargement des données",
            empty: "Aucune donnée disponible",
            retryButton: "Réessayer",
            refreshButton: "Actualiser",
            editButton: "Modifier",
            deleteButton: "Supprimer",
            deleteSuccess: "Actualité supprimé avec succès !",
            deleteError: "Erreur lors de la suppression !",
            deleteConfirmDescription:
              "Voulez-vous vraiment supprimer ce service ? Cette action est irréversible.",
          },
          api: {
            deleteEndpoint: (id) => `/api/news/${id}`,
          },
        }}
      />
    </div>
  );
}
