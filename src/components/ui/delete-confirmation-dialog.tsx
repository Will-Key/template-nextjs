import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeleteConfirmationInterface {
  itemName: string
  isDeleting?: boolean
  onDelete: () => void
  buttonLabel: string
  buttonVariant:
    | "outline"
    | "default"
    | "link"
    | "destructive"
    | "secondary"
    | "ghost"
  buttonSize: "default" | "sm" | "lg" | "icon" | null | undefined
  showIcon: boolean
}

// Composant de boîte de dialogue de confirmation de suppression
export default function DeleteConfirmationDialog({
  itemName = "cet élément",
  isDeleting = false,
  onDelete = () => {},
  buttonLabel = "Supprimer",
  buttonVariant = "outline",
  buttonSize = "default",
  showIcon = true,
}: DeleteConfirmationInterface) {
  const [open, setOpen] = useState(false)

  const handleConfirmDelete = () => {
    onDelete()
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          className="flex items-center gap-2"
        >
          {showIcon && <Trash2 size={16} />}
          {buttonLabel}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
          <AlertDialogDescription>
            Voulez-vous vraiment supprimer {itemName} ? Cette action est
            irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            className="bg-red-500 hover:bg-red-600"
          >
            {isDeleting ? "Suppression en cours..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
