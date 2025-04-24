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
import { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ServiceFormProps } from "./model";

const formSchema = z.object({
  label: z.string().min(3, {
    message: "Le service doit être au moins 3 caractères",
  }),
  description: z.string().min(100, {
    message: "La description doit être au moins 100 caractères",
  }),
  image: z.any().optional(),
});

/**
 * 
 image: z
    .any()
    .refine((file) => file?.length === 1, {
      message: "Une image est requise",
    })
    .refine((file) => file?.[0]?.type?.startsWith("image/"), {
      message: "Le fichier doit être une image",
    }),
 */

export function ServiceForm({ service, onClose, onSuccess }: ServiceFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      description: "",
      image: undefined,
    },
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service) {
      form.reset({
        label: service.label,
        description: service.description,
      });
    }
  }, [service, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    const formData = new FormData();

    formData.append("label", values.label);
    formData.append("description", values.description);
    if (file) formData.append("image", file);

    const endpoint = service ? `/api/services/${service.id}` : "/api/services";

    const method = service ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      body: service ? JSON.stringify(values) : formData,
      headers: service
        ? {
            "Content-Type": "application/json",
          }
        : undefined,
    });

    if (res.ok) {
      toast.success(`Service ${service ? "modifié" : "créé"} avec succès`);
      form.reset();
      setFile(null);
      onSuccess?.();
    } else {
      console.log(res);
      toast.error("Une erreur est survenue");
    }
    setLoading(false);
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
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image illustrative</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Chargement..." : "Créer"}
          </Button>
          <Button
            type="button"
            variant={"outline"}
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}
