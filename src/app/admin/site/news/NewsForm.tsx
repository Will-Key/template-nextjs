"use client"

import { z } from "zod"
import { NewsFormProps } from "./models"
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
import { Textarea } from "@/components/ui/textarea"
import { FormRichTextEditor } from "@/components/ui/form-rich-text-editor"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { DatePicker } from "@/components/ui/date-picker"

const newsSchema = z.object({
  label: z.string().min(3, {
    message: "Le libellé doit être au moins 3 caractères",
  }),
  type: z
    .string()
    .min(3, {
      message: "Le type doit être au moins 3 caractères",
    })
    .max(30, {
      message: "Le type ne peut pas excéder 30 caractères",
    }),
  eventDate: z.coerce.date(),
  description: z
    .string()
    .min(10, {
      message: "La description doit être au moins 10 caractères",
    })
    .max(150, {
      message: "La description ne peut pas excéder 150 caractères",
    }),
  content: z.string().min(100, {
    message: "Le contenu doit être au moins 100 caractères",
  }),
})

type NewsFormValues = z.infer<typeof newsSchema>

export default function NewsForm({
  news,
  mode = "new",
  onClose,
  onSuccess,
}: NewsFormProps) {
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      label: "",
      type: "",
      eventDate: new Date(),
      description: "",
      content: "",
    },
  })
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (news) {
      form.reset({
        label: news.label,
        type: news.type,
        eventDate: news.eventDate,
        description: news.description,
        content: news.content,
      })
    }
  }, [news, form])

  const onSubmit: SubmitHandler<NewsFormValues> = async (
    values: NewsFormValues
  ) => {
    setLoading(true)

    try {
      const endpoint = news ? `/api/news/${news.id}` : "/api/news"

      const method = news ? "PUT" : "POST"

      const res = await fetch(endpoint, {
        method,
        body: JSON.stringify(values),
      })

      if (res.ok) {
        toast.success(`Actualité ${news ? "modifié" : "créé"} avec succès`)
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
        className="space-y-8 overflow-auto"
      >
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input
                  placeholder="Entrer le titre"
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
          name="eventDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de l'événement</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Sélectionner une date"
                  disabled={mode === "view"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type d'actialité</FormLabel>
              <FormControl>
                <Input
                  placeholder="Entrer le type d'actualité"
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
        <FormRichTextEditor
          name="content"
          label="Content"
          description=""
          placeholder="Ecrivez le contenu ici"
          disabled={mode === "view"}
        />
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Chargement..." : news?.id ? "Modifier" : "Créer"}
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
  )
}
