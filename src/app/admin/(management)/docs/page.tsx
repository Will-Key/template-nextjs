"use client"

import AppHeader from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { DialogHeader } from "@/components/ui/dialog"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { DocForm } from "./DocForm"
import { FetchingDataTable } from "@/components/ui/fetching-data-table"
import {
  createActionsColumn,
  createColumn,
  createDateColumn,
} from "@/lib/column-helpers"
import { Download, Trash } from "lucide-react"
import { docsService } from "@/lib/api-service"
import DeleteConfirmationDialog from "@/components/ui/delete-confirmation-dialog"
import { toast } from "sonner"
import { Docs } from "@prisma/client"
import { useDeleteDoc } from "@/hooks/useDeleteDoc"

export default function Page() {
  const [open, setOpen] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [formMode, setFormMode] = useState<"new">("new")
  const { deleteDoc, isDeleting } = useDeleteDoc()

  const handleDeleteDoc = async (doc: Docs) => {
    try {
      const success = await deleteDoc(doc, false)
      if (success) {
        toast.success("Document supprimé avec succès")
        fetchDocs()
        setRefresh((prev) => prev + 1)
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression")
      console.error(error)
    }
  }

  // Définition des colonnes en utilisant les helpers
  const columns = [
    createColumn<Docs>("name", "Nom"),

    createDateColumn<Docs>("createdAt", "Date de création", {
      dateStyle: "medium",
      locale: "fr-FR",
    }),

    createColumn<Docs>("createdBy.name", "Créé par"),

    createActionsColumn<Docs>([
      {
        label: "Télécharger",
        icon: Download,
        onClick: (Doc) => {
          handleDownload(Doc)
        },
      },
      {
        label: "Supprimer",
        icon: Trash,
        renderButton: (Doc) => (
          <DeleteConfirmationDialog
            itemName={`le document "${Doc.name}"`}
            isDeleting={isDeleting}
            onDelete={() => handleDeleteDoc(Doc)}
            buttonLabel="Supprimer"
            buttonVariant="ghost"
            buttonSize="sm"
            showIcon={false}
          />
        ),
      },
    ]),
  ]

  // Fonction pour charger les données
  const fetchDocs = async () => {
    return await docsService.getAll()
  }

  const handleDownload = async (doc: Docs | null = null) => {
    if (!doc) {
      toast.error("Aucun document sélectionné")
      return
    }

    try {
      // Appeler l'API de téléchargement
      const response = await fetch(`/api/docs/${doc.id}/download`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      // Récupérer le blob du fichier
      const blob = await response.blob()

      // Créer un URL temporaire pour le blob
      const url = window.URL.createObjectURL(blob)

      // Créer un lien temporaire et déclencher le téléchargement
      const link = document.createElement("a")
      link.href = url
      link.download = doc.name // Nom du fichier à télécharger
      document.body.appendChild(link)
      link.click()

      // Nettoyer
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success("Téléchargement commencé")
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error)
      toast.error("Erreur lors du téléchargement du document")
    }
  }

  const handleOpenForm = (formMode: "new") => {
    setFormMode(formMode)
    setOpen(true)
  }

  const handleSuccess = () => {
    setOpen(false)
    fetchDocs()
    setRefresh(refresh + 1)
  }

  useEffect(() => {
    fetchDocs()
  }, [])

  return (
    <div>
      <AppHeader parent="Administration" child="Docs" />
      <div className="mt-4 p-5 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Docs</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm("new")}>
              Ajouter un document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Nouveau Document</DialogTitle>
            </DialogHeader>
            <DocForm
              mode={formMode}
              onClose={() => setOpen(false)}
              onSuccess={handleSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-4 p-5">
        <FetchingDataTable<Docs, Docs>
          key={refresh}
          columns={columns}
          fetchData={fetchDocs}
          searchColumn="name"
          searchPlaceholder="Rechercher un document"
          emptyMessage="Aucune document disponible. Créez votre premier document en cliquant sur le bouton ci-dessus."
          errorMessage="Impossible de charger les documents"
        />
      </div>
    </div>
  )
}
