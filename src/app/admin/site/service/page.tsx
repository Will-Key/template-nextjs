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
import ServiceList from "./ServiceList";

export default function Page() {
  const [open, setOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  const fetchServices = async () => {
    const res = await fetch("/api/services");
    const data = await res.json();
    setServices(data);
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
          <DialogContent className="sm:max-w-[650px]">
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
      <ServiceList
        services={services}
        onEdit={(service) => handleOpenForm(service)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
