"use client"

import React, { useCallback, useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Loader2, AlertTriangle, RefreshCcw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface FetchingDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  fetchData: () => Promise<TData[]>
  searchColumn?: string
  searchPlaceholder?: string
  title?: string
  emptyMessage?: string
  errorMessage?: string
}

export function FetchingDataTable<TData, TValue>({
  columns,
  fetchData,
  searchColumn,
  searchPlaceholder,
  title,
  emptyMessage = "Aucune donnée disponible",
  errorMessage = "Une erreur est survenue lors du chargement des données",
}: FetchingDataTableProps<TData, TValue>) {
  const [data, setData] = useState<TData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchData()
      setData(result)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(
        err instanceof Error ? err : new Error("Une erreur est survenue")
      )
    } finally {
      setLoading(false)
    }
  }, [fetchData])

  useEffect(() => {
    loadData()
  }, [loadData])

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

  if (data.length === 0) {
    return (
      <div className="w-full border rounded-md p-8 flex flex-col items-center justify-center text-center">
        <p className="mb-4 text-muted-foreground">{emptyMessage}</p>
        <Button variant="outline" onClick={loadData}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <DataTable
        columns={columns}
        data={data}
        searchColumn={searchColumn}
        searchPlaceholder={searchPlaceholder}
      />
    </div>
  )
}
