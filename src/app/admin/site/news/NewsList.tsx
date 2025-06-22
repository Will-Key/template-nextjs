"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import Image from "next/image"
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
import { AlertTriangle, Loader2, RefreshCcw } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { NewsListProps } from "./models"

export default function NewsList({
  news,
  onEdit,
  onSuccess,
  loading,
  error,
  loadData,
}: NewsListProps) {
  const errorMessage = "Une erreur est survenue lors du chargement des données"
  const emptyMessage = "Aucune donnée disponible"
  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/news/${id}`, {
      method: "DELETE",
    })

    if (res.ok) {
      toast.success("Actualité supprimé avec succès !")
      onSuccess?.()
    } else {
      toast.error("Erreur lors de la suppression !")
    }
  }

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Chargement des données...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          <div className="flex flex-col space-y-4">
            <p>{errorMessage}</p>
            <p className="text-sm">{error.message}</p>
            <Button variant="outline" className="w-fit" onClick={loadData}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div
      className={
        news.length
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-6"
          : "flex justify-center"
      }
    >
      {news.length ? (
        news.map((elt) => (
          <Card key={elt.id} className="justify-between">
            <CardContent className="p-4 flex flex-col">
              {elt.image && (
                <Image
                  src={elt.image}
                  alt={elt.label}
                  width={400}
                  height={200}
                  className="rounded mb-2 object-cover max-h-[180px]"
                />
              )}
              <h3 className="font-semibold text-lg">{elt.label}</h3>
              <div className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {elt.description}
              </div>
            </CardContent>
            <CardFooter className="flex align-bottom justify-end gap-2">
              <Button
                className="bg-primary dark:bg-primary text-white"
                size="sm"
                variant="outline"
                onClick={() => onEdit(elt)}
              >
                Modifier
              </Button>
              {/* <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(elt.id)}
            >
              Supprimer
            </Button> */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Supprimer</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Voulez-vous vraiment supprimer cette actualité ? Cette
                      action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(elt.id)}>
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="w-full border rounded-md p-8 flex flex-col items-center justify-center text-center">
          <p className="mb-4 text-muted-foreground">{emptyMessage}</p>
          <Button variant="outline" onClick={loadData}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      )}
    </div>
  )
}
