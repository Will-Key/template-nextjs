"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import { ServiceListProps } from "./model";

export default function ServiceList({
  services,
  onEdit,
  onSuccess,
}: ServiceListProps) {
  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/services/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Service supprimé avec succès !");
      onSuccess?.();
    } else {
      toast.error("Erreur lors de la suppression !");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-6">
      {services.map((service) => (
        <Card key={service.id} className="justify-between">
          <CardContent className="p-4 flex flex-col">
            {service.image && (
              <Image
                src={service.image}
                alt={service.label}
                width={400}
                height={200}
                className="rounded mb-2 object-cover max-h-[180px]"
              />
            )}
            <h3 className="font-semibold text-lg">{service.label}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {service.description}
            </p>
          </CardContent>
          <CardFooter className="flex align-bottom justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(service)}>
              Modifier
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(service.id)}
            >
              Supprimer
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
