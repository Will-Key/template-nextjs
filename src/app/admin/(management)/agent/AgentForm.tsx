"use client"

import { z } from "zod"
import { UserFormProps } from "./model"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Role } from "@prisma/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const userSchema = z.object({
  name: z.string().min(3, {
    message: "Le nom doit être au moins 3 caractères",
  }),
  email: z.string().email({
    message: "Veuillez entrer un email valide",
  }),
  password: z
    .string()
    .min(8, {
      message: "Le mot de passe doit être d'au moins 8 caractères",
    })
    .optional(),
  role: z.enum(["agent", "admin"]),
  status: z.enum(["active", "inactive"]),
})

type UserFormValues = z.infer<typeof userSchema>

const roleOptions = [
  { value: "agent" as const, label: "Agent" },
  { value: "admin" as const, label: "Administrateur" },
]

const statusOptions = [
  { value: "active" as const, label: "Actif" },
  { value: "inactive" as const, label: "Inactif" },
]

export default function AgentForm({
  user,
  mode = "new",
  onClose,
  onSuccess,
}: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "agent",
      status: "active",
    },
  })
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        password: "", // Ne pas pré-remplir le mot de passe pour la sécurité
        role:
          user.role === Role.super_admin
            ? "admin"
            : (user.role as "agent" | "admin"),
        status: user.status as "active" | "inactive",
      })
    }
  }, [user, form])

  const onSubmit: SubmitHandler<UserFormValues> = async (
    values: UserFormValues
  ) => {
    setLoading(true)

    try {
      const endpoint = user ? `/api/agents/${user.id}` : "/api/agents"
      const method = user ? "PUT" : "POST"

      // Pour la modification, ne pas envoyer le mot de passe s'il est vide
      const payload: any = { ...values }
      if (user && !values.password?.trim()) {
        delete payload.password
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(`Utilisateur ${user ? "modifié" : "créé"} avec succès`)
        form.reset()
        onSuccess?.()
      } else {
        const errorData = await res.json().catch(() => ({}))
        toast.error(errorData.error || "Une erreur est survenue")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Une erreur est survenue lors de la soumission")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 overflow-auto"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input
                  placeholder="Entrer le nom complet"
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="exemple@email.com"
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Minimum 8 caractères"
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
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rôle</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={mode === "view"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={mode === "view"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode !== "view" && (
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Chargement..." : user?.id ? "Modifier" : "Créer"}
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
  )
}
