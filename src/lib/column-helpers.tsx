import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

/**
 * Crée une colonne de base pour une propriété donnée
 */
export function createColumn<T>(
  accessorKey: keyof T | string,
  header: string,
  options?: {
    enableSorting?: boolean
    enableHiding?: boolean
  }
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    enableSorting: options?.enableSorting ?? true,
    enableHiding: options?.enableHiding ?? true,
  }
}

/**
 * Crée une colonne pour afficher une valeur monétaire
 */
export function createCurrencyColumn<T>(
  accessorKey: keyof T | string,
  header: string,
  options?: {
    currency?: string
    locale?: string
  }
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue(accessorKey as string))
      const formatted = new Intl.NumberFormat(options?.locale || "fr-FR", {
        style: "currency",
        currency: options?.currency || "EUR",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  }
}

/**
 * Crée une colonne pour afficher une date formatée
 */
export function createDateColumn<T>(
  accessorKey: keyof T | string,
  header: string,
  options?: {
    dateStyle?: "full" | "long" | "medium" | "short"
    timeStyle?: "full" | "long" | "medium" | "short"
    locale?: string
  }
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: ({ row }) => {
      const dateValue = row.getValue(accessorKey as string)
      if (!dateValue) return null

      const date = new Date(dateValue as string)
      const formatted = new Intl.DateTimeFormat(options?.locale || "fr-FR", {
        dateStyle: options?.dateStyle || "medium",
        timeStyle: options?.timeStyle,
      }).format(date)

      return <div>{formatted}</div>
    },
  }
}

/**
 * Crée une colonne pour afficher un statut avec un indicateur coloré
 */
export function createStatusColumn<T>(
  accessorKey: keyof T | string,
  header: string,
  options?: {
    statuses: Record<string, { color: string; label?: string }>
  }
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: ({ row }) => {
      const status = row.getValue(accessorKey as string) as string
      const statusConfig = options?.statuses?.[status] || {
        color: "bg-gray-400",
      }

      return (
        <div className="flex items-center">
          <div className={`mr-2 h-2 w-2 rounded-full ${statusConfig.color}`} />
          <span className="capitalize">{statusConfig.label || status}</span>
        </div>
      )
    },
  }
}

/**
 * Crée une colonne pour afficher des badges
 */
export function createBadgeColumn<T>(
  accessorKey: keyof T | string,
  header: string,
  options?: {
    variantMap?: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    >
    maxBadges?: number
  }
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: ({ row }) => {
      const value = row.getValue(accessorKey as string)
      const items = Array.isArray(value) ? value : [value]
      const maxBadges = options?.maxBadges || 3

      return (
        <div className="flex flex-wrap gap-1">
          {items.slice(0, maxBadges).map((item: string, index: number) => {
            const variant = options?.variantMap?.[item] || "default"
            return (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <Badge key={index} variant={variant as any}>
                {item}
              </Badge>
            )
          })}
          {items.length > maxBadges && (
            <Badge variant="outline">+{items.length - maxBadges}</Badge>
          )}
        </div>
      )
    },
  }
}

/**
 * Crée une colonne d'actions avec un menu déroulant
 */
export function createActionsColumn<T>(
  actions: Array<{
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick?: (data: T) => void
    renderButton?: (row: T) => React.ReactNode
  }>
): ColumnDef<T> {
  return {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const data = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {actions.map((action, i) => {
              const Icon = action.icon
              // Si renderButton est fourni, l'utiliser
              if (action.renderButton) {
                return (
                  <div key={i} className="flex items-center">
                    {action.renderButton(data)}
                  </div>
                )
              }

              // Sinon, utiliser le rendu par défaut
              return (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  onClick={() => action.onClick?.(data)}
                >
                  {Icon && <Icon className="h-4 w-4 mr-1" />}
                  {action.label}
                </Button>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }
}
