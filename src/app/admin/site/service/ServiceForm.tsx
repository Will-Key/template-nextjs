"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { ServiceFormProps } from "./model"
import { FormChipsInput } from "@/components/ui/form-chips-input"
import { FormRichTextEditor } from "@/components/ui/form-rich-text-editor"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  label: z.string().min(3, {
    message: "Le service doit être au moins 3 caractères",
  }),
  description: z.string().min(10, {
    message: "La description doit être au moins 10 caractères",
  }),
  content: z.array(z.string()).min(1, "Au moins un contenu"),
  image: z.any().optional(),
})

export function ServiceForm({ service, onClose, onSuccess }: ServiceFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      description: "",
      content: [],
      image: undefined,
    },
  })

  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (service) {
      form.reset({
        label: service.label,
        description: service.description,
        content: service.content,
        image: service.image,
      })
    }
  }, [service, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("label", values.label)
      formData.append("description", values.description)
      formData.append("content", values.content.join(","))
      if (file) formData.append("image", file)

      const endpoint = service ? `/api/services/${service.id}` : "/api/services"
      const method = service ? "PUT" : "POST"

      const res = await fetch(endpoint, {
        method,
        body: formData,
      })

      if (res.ok) {
        toast.success(`Service ${service ? "modifié" : "créé"} avec succès`)
        form.reset()
        setFile(null)
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
              <FormLabel>Decription</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Entrer la description"
                  {...field}
                ></Textarea>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormRichTextEditor
          name="description"
          label="Content"
          description=""
          placeholder="Ecrivez le contenu ici"
        /> */}
        <FormChipsInput
          name="content"
          label="Contenu du service"
          placeholder="Entrer la composition de ce service..."
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
            {loading ? "Chargement..." : service?.id ? "Modifier" : "Créer"}
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
