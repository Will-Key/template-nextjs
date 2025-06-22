import { z } from "zod"
import { DocFormProps } from "./model"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Le libellé doit être au moins 3 caractères",
  }),
  file: z.any().optional(),
})

type DocFormValues = z.infer<typeof formSchema>

export function DocForm({ onClose, onSuccess }: DocFormProps) {
  const form = useForm<DocFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      file: undefined,
    },
  })

  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (values: DocFormValues) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", values.name)

      if (file) {
        formData.append("file", file)
      }

      const endpoint = "/api/docs"
      const method = "POST"

      const res = await fetch(endpoint, {
        method,
        body: formData,
      })

      if (res.ok) {
        toast.success(`Document téléchargé avec succès`)
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du fichier</FormLabel>
              <FormControl>
                <Input placeholder="Entrer le nom du fichier" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fichier</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0] ?? null
                    setFile(selectedFile)
                    // Optionnel: mettre à jour le champ du formulaire
                    field.onChange(selectedFile)
                  }}
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
            variant="outline"
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
