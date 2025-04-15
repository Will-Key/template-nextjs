"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Service } from "@prisma/client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  label: z.string().min(3, {
    message: "Le service doit être au moins 3 caractères",
  }),
  description: z.string().min(100, {
    message: "La description doit être au moins 100 caractères",
  }),
});

export function ServiceForm({
  service,
  onClose,
  onSuccess,
}: {
  service?: Service;
  onClose?: () => void;
  onSuccess?: () => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      description: "",
    },
  });

  // Remplir les champs si mode édition
  useEffect(() => {
    if (service) {
      form.reset({
        label: service.label,
        description: service.description,
      });
    }
  }, [service, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const res = await fetch(
      service?.id ? `/api/services/${service.id}` : `/api/services`,
      {
        method: service?.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      }
    );

    if (!res.ok) throw new Error("Erreur lors de la soumission");

    const data = await res.json();
    toast.success(service?.id ? "Service mis à jour" : "Service créé");

    onClose?.();
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Libellé</FormLabel>
              <FormControl>
                <Input placeholder="Entrer le libellé" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Entrer la description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">Créer</Button>
          <Button type="button" className="ml-0.5">
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}
