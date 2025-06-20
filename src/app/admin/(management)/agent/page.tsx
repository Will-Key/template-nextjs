"use client"

import AppHeader from "@/components/app-header"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { usersService } from "@/lib/api-service"
import { FetchingDataTable } from "@/components/ui/fetching-data-table"
import { toast } from "sonner"
import {
  createActionsColumn,
  createColumn,
  createDateColumn,
} from "@/lib/column-helpers"
import { Eye, Pencil } from "lucide-react"
import DeleteConfirmationDialog from "@/components/ui/delete-confirmation-dialog"
import AgentForm from "./AgentForm"
import { User } from "@prisma/client"

export default function Page() {
  const [formMode, setFormMode] = useState<"new" | "edit" | "view">("new")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [open, setOpen] = useState<boolean>(false)
  const [refresh, setRefresh] = useState<number>(0)

  const handleDeleteUser = async (UserId: string) => {
    try {
      await usersService.delete(UserId)
      toast.success("User supprimée avec succès")
      fetchUser()
      setRefresh((prev) => prev + 1)
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  // Définition des colonnes en utilisant les helpers
  const columns = [
    createColumn<User>("name", "Nom complet"),

    createColumn<User>("email", "Email"),

    createDateColumn<User>("createdAt", "Date de création", {
      dateStyle: "medium",
      locale: "fr-FR",
    }),

    createColumn<User>("createdBy.name", "Créé par"),

    createActionsColumn<User>([
      {
        label: "Voir",
        icon: Eye,
        onClick: (User) => {
          handleOpenForm(User, "view")
        },
      },
      {
        label: "Modifier",
        icon: Pencil,
        onClick: (User) => {
          handleOpenForm(User, "edit")
        },
      },
      {
        label: "Supprimer",
        renderButton: (User) => (
          <DeleteConfirmationDialog
            itemName={`l'agent "${User.name}"`}
            onDelete={() => handleDeleteUser(`${User.id}`)}
            buttonLabel="Supprimer"
            buttonVariant="ghost"
            buttonSize="sm"
            showIcon={false}
          />
        ),
      },
    ]),
  ]

  const fetchUser = async () => {
    return await usersService.getAll()
  }

  const handleOpenForm = (
    User: User | null = null,
    formMode: "new" | "edit" | "view"
  ) => {
    setFormMode(formMode)
    setSelectedUser(User)
    setOpen(true)
  }

  const handleSuccess = () => {
    setOpen(false)
    fetchUser()
    setRefresh(refresh + 1)
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <div>
      <AppHeader parent="Administration" child="Agent" />
      <div className="mt-4 p-5 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Agent</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm(null, "new")}>
              Créer un agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[660px] max-h-[660px] overflow-auto">
            <DialogHeader>
              <DialogTitle>
                {formMode === "edit"
                  ? "Modifier"
                  : formMode === "new"
                  ? "Créer"
                  : "Détails"}{" "}
                agent
              </DialogTitle>
            </DialogHeader>
            <AgentForm
              user={selectedUser}
              mode={formMode}
              onClose={() => setOpen(false)}
              onSuccess={handleSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-4 p-5">
        <FetchingDataTable<User, User>
          key={refresh}
          columns={columns}
          fetchData={fetchUser}
          searchColumn="name"
          searchPlaceholder="Rechercher un agent"
          emptyMessage="Aucun agent disponible. Créez votre premier agent en cliquant sur le bouton ci-dessus."
          errorMessage="Impossible de charger les agents"
        />
      </div>
    </div>
  )
}
