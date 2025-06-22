"use client"

import React, { ComponentType, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { FetchingDataTable } from "@/components/ui/fetching-data-table"
import { BaseApiService } from "@/lib/api-service"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

// Interface pour les props communes aux composants enveloppés
export interface WithDataTableProps<T> {
  title: string
  service: BaseApiService<T>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[]
  searchColumn?: string
  searchPlaceholder?: string
  emptyMessage?: string
  FormComponent?: ComponentType<{
    data?: T
    onClose?: () => void
    onSuccess?: () => void
  }>
  dialogWidth?: "sm" | "md" | "lg" | "xl"
  createButtonLabel?: string
  editTitle?: string
  createTitle?: string
}

// Higher-Order Component pour créer une page avec DataTable
export function withDataTable<T extends { id: string }>(
  options: WithDataTableProps<T>
) {
  // Retourner un composant fonctionnel
  return function DataTablePage() {
    const [open, setOpen] = useState(false)
    const [refresh, setRefresh] = useState(0)
    const [selectedItem, setSelectedItem] = useState<T | null>(null)

    const {
      title,
      service,
      columns,
      searchColumn,
      searchPlaceholder,
      emptyMessage = "Aucun élément disponible",
      FormComponent,
      dialogWidth = "md",
      createButtonLabel = "Nouveau",
      editTitle = "Modifier",
      createTitle = "Créer",
    } = options

    const fetchData = async () => {
      return await service.getAll()
    }

    const handleSuccess = () => {
      setOpen(false)
      setSelectedItem(null)
      setRefresh((prev) => prev + 1)
    }

    const handleClose = () => {
      setOpen(false)
      setSelectedItem(null)
    }

    const dialogSizeMap = {
      sm: "sm:max-w-[400px]",
      md: "sm:max-w-[600px]",
      lg: "sm:max-w-[800px]",
      xl: "sm:max-w-[1000px]",
    }

    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{title}</h1>

          {FormComponent && (
            <Button onClick={() => setOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {createButtonLabel}
            </Button>
          )}
        </div>

        <FetchingDataTable
          key={refresh}
          columns={columns}
          fetchData={fetchData}
          searchColumn={searchColumn}
          searchPlaceholder={searchPlaceholder}
          emptyMessage={emptyMessage}
          errorMessage={`Impossible de charger les données de ${title.toLowerCase()}`}
        />

        {FormComponent && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className={dialogSizeMap[dialogWidth]}>
              <DialogHeader>
                <DialogTitle>
                  {selectedItem ? editTitle : createTitle}
                </DialogTitle>
              </DialogHeader>
              <FormComponent
                data={selectedItem || undefined}
                onClose={handleClose}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    )
  }
}
