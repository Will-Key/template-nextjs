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
import { ReactNode } from "react"

// Types géneriques
export interface BaseItem {
  id: number | string
  [key: string]: any
}

export interface DataListConfig {
  // Messages personnalisables
  messages: {
    loading?: string
    error?: string
    empty?: string
    deleteSuccess?: string
    deleteError?: string
    deleteConfirmTitle?: string
    deleteConfirmDescription?: string
    editButton?: string
    deleteButton?: string
    cancelButton?: string
    confirmButton?: string
    retryButton?: string
    refreshButton?: string
  }

  // Configuration des colonnes responsive
  gridCols?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }

  // API configuration
  api?: {
    deleteEndpoint: (id: number | string) => string
  }

  // Customisation visuelle
  itemHeight?: string
  imageConfig?: {
    width?: number
    height?: number
    className?: string
  }
}

export interface DataListProps<T extends BaseItem> {
  // Données
  data: T[]

  // États
  loading?: boolean
  error?: Error | null

  // Callbacks
  onEdit?: (item: T) => void
  onDelete?: (id: number | string) => Promise<void>
  onSuccess?: () => void
  loadData?: () => void

  // Configuration
  config?: DataListConfig

  // Fonctions de rendu personnalisées
  renderItem?: (item: T) => ReactNode
  renderTitle?: (item: T) => ReactNode
  renderDescription?: (item: T) => ReactNode
  renderImage?: (item: T) => ReactNode
  renderActions?: (item: T, defaultActions: ReactNode) => ReactNode

  // Champs par défaut à utiliser si les render functions ne sont pas fournies
  titleField?: keyof T
  descriptionField?: keyof T
  imageField?: keyof T

  // Contrôles d'affichage
  showEdit?: boolean
  showDelete?: boolean
}

const defaultConfig: Required<DataListConfig> = {
  messages: {
    loading: "Chargement des données...",
    error: "Une erreur est survenue lors du chargement des données",
    empty: "Aucune donnée disponible",
    deleteSuccess: "Élément supprimé avec succès !",
    deleteError: "Erreur lors de la suppression !",
    deleteConfirmTitle: "Êtes-vous sûr ?",
    deleteConfirmDescription:
      "Voulez-vous vraiment supprimer cet élément ? Cette action est irréversible.",
    editButton: "Modifier",
    deleteButton: "Supprimer",
    cancelButton: "Annuler",
    confirmButton: "Supprimer",
    retryButton: "Réessayer",
    refreshButton: "Actualiser",
  },
  gridCols: {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 3,
  },
  api: {
    deleteEndpoint: (id) => `/api/items/${id}`,
  },
  itemHeight: "auto",
  imageConfig: {
    width: 400,
    height: 200,
    className: "rounded mb-2 object-cover max-h-[180px]",
  },
}

export default function DataList<T extends BaseItem>({
  data,
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onSuccess,
  loadData,
  config = {
    messages: {},
  },
  renderItem,
  renderTitle,
  renderDescription,
  renderImage,
  renderActions,
  titleField = "title" as keyof T,
  descriptionField = "description" as keyof T,
  imageField = "image" as keyof T,
  showEdit = true,
  showDelete = true,
}: DataListProps<T>) {
  const mergedConfig = { ...defaultConfig, ...config }
  const { messages, gridCols, api, imageConfig } = mergedConfig

  // Fonction de suppression par défaut
  const handleDelete = async (id: number | string) => {
    if (onDelete) {
      await onDelete(id)
      return
    }

    try {
      const res = await fetch(api.deleteEndpoint(id), {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success(messages.deleteSuccess)
        onSuccess?.()
      } else {
        toast.error(messages.deleteError)
      }
    } catch (error) {
      toast.error(messages.deleteError)
    }
  }

  // Génération des classes CSS pour la grille
  const getGridClasses = () => {
    const classes = ["grid"]
    if (gridCols.sm) classes.push(`grid-cols-${gridCols.sm}`)
    if (gridCols.md) classes.push(`md:grid-cols-${gridCols.md}`)
    if (gridCols.lg) classes.push(`lg:grid-cols-${gridCols.lg}`)
    if (gridCols.xl) classes.push(`xl:grid-cols-${gridCols.xl}`)
    classes.push("gap-4", "m-6")
    return classes.join(" ")
  }

  // Rendu des éléments par défaut
  const renderDefaultTitle = (item: T) => (
    <h3 className="font-semibold text-lg">{String(item[titleField] || "")}</h3>
  )

  const renderDefaultDescription = (item: T) => (
    <div className="text-sm text-muted-foreground line-clamp-3 mb-3">
      {String(item[descriptionField] || "")}
    </div>
  )

  const renderDefaultImage = (item: T) => {
    const imageSrc = item[imageField] as string
    if (!imageSrc) return null

    return (
      <Image
        src={imageSrc}
        alt={String(item[titleField] || "Image")}
        width={imageConfig.width}
        height={imageConfig.height}
        className={imageConfig.className}
      />
    )
  }

  const renderDefaultActions = (item: T) => (
    <>
      {showEdit && onEdit && (
        <Button
          className="bg-primary dark:bg-primary text-black"
          size="sm"
          variant="outline"
          onClick={() => onEdit(item)}
        >
          {messages.editButton}
        </Button>
      )}

      {showDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              {messages.deleteButton}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{messages.deleteConfirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {messages.deleteConfirmDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{messages.cancelButton}</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(item.id)}>
                {messages.confirmButton}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )

  // États de chargement
  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>{messages.loading}</p>
      </div>
    )
  }

  // État d'erreur
  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          <div className="flex flex-col space-y-4">
            <p>{messages.error}</p>
            <p className="text-sm">{error.message}</p>
            {loadData && (
              <Button variant="outline" className="w-fit" onClick={loadData}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                {messages.retryButton}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  // Rendu principal
  return (
    <div className={data.length ? getGridClasses() : "flex justify-center"}>
      {data.length ? (
        data.map((item) => (
          <Card key={item.id} className="justify-between">
            {renderItem ? (
              renderItem(item)
            ) : (
              <>
                <CardContent className="p-4 flex flex-col">
                  {renderImage ? renderImage(item) : renderDefaultImage(item)}
                  {renderTitle ? renderTitle(item) : renderDefaultTitle(item)}
                  {renderDescription
                    ? renderDescription(item)
                    : renderDefaultDescription(item)}
                </CardContent>
                <CardFooter className="flex align-bottom justify-end gap-2">
                  {renderActions
                    ? renderActions(item, renderDefaultActions(item))
                    : renderDefaultActions(item)}
                </CardFooter>
              </>
            )}
          </Card>
        ))
      ) : (
        <div className="w-full border rounded-md p-8 flex flex-col items-center justify-center text-center">
          <p className="mb-4 text-muted-foreground">{messages.empty}</p>
          {loadData && (
            <Button variant="outline" onClick={loadData}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              {messages.refreshButton}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
