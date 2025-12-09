"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormationFormProps } from "./model";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormChipsInput } from "@/components/ui/form-chips-input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const formSchema = z.object({
  label: z.string().min(3, {
    message: "Le libellé doit être au moins 3 caractères",
  }),
  description: z.string().min(10, {
    message: "La description doit être au moins 10 caractères",
  }),
  days: z.coerce.number().int().nonnegative().min(1),
  maxParticipants: z.coerce.number().int().nonnegative().min(1),
  amount: z.coerce.number().int().nonnegative().min(0),
  modules: z.array(z.string()).min(1, "Au moins un module"),
});

type FormationFormValues = z.infer<typeof formSchema>;

export function FormationForm({
  formation,
  mode = "new",
  onClose,
  onSuccess,
}: FormationFormProps) {
  const form = useForm<FormationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      description: "",
      days: 1,
      maxParticipants: 1,
      amount: 0,
      modules: [],
    },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formation) {
      form.reset({
        label: formation.label,
        description: formation.description,
        days: formation.days,
        maxParticipants: formation.maxParticipants,
        amount: formation.amount,
        modules: formation.modules,
      });
    }
  }, [formation, form]);

  const onSubmit: SubmitHandler<FormationFormValues> = async (
    values: z.infer<typeof formSchema>
  ) => {
    setLoading(true);

    try {
      const endpoint = formation
        ? `/api/formations/${formation.id}`
        : "/api/formations";

      const method = formation ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        body: JSON.stringify(values),
      });

      if (res.ok) {
        toast.success(
          `Formation ${formation ? "modifié" : "créé"} avec succès`
        );
        form.reset();
        onSuccess?.();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Une erreur est survenue lors de la soumission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 overflow-auto">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Libellé</FormLabel>
              <FormControl>
                <Input
                  placeholder="Entrer le libellé"
                  disabled={mode === "view"}
                  {...field}
                />
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
                <Textarea
                  placeholder="Entrer la description"
                  disabled={mode === "view"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de jour(s)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Entrer le nombre de jour de la formation"
                  disabled={mode === "view"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="maxParticipants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de participant(s)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Entrer le nombre de participant de la formation"
                  disabled={mode === "view"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Montant</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Entrer le montant de la formation"
                  disabled={mode === "view"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormChipsInput
          name="modules"
          label="Module de la formation"
          placeholder="Entrer les modules de cette formation..."
          disabled={mode === "view"}
        />
        {mode !== "view" && (
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Chargement..." : formation?.id ? "Modifier" : "Créer"}
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
        )}
      </form>
    </Form>
  );
}
