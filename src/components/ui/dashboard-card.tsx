"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

// Types pour les props
export interface DashboardCardProps {
  icon: LucideIcon | ReactNode
  title: string
  total: number
  active?: number
  inactive?: number
  className?: string
  iconClassName?: string
  titleClassName?: string
  totalClassName?: string
  activeClassName?: string
  inactiveClassName?: string
}

export interface DashboardCardsGridProps {
  cards: DashboardCardProps[]
  gridCols?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  className?: string
}

// Composant pour une seule card
export function DashboardCard({
  icon,
  title,
  total,
  active,
  inactive,
  className = "",
  iconClassName = "h-6 w-6 text-primary",
  titleClassName = "text-sm font-medium text-muted-foreground",
  totalClassName = "text-2xl font-bold text-foreground",
  activeClassName = "text-sm text-green-600 dark:text-green-400",
  inactiveClassName = "text-sm text-red-600 dark:text-red-400",
}: DashboardCardProps) {
  // Rendu de l'icône
  const renderIcon = () => {
    if (typeof icon === "function") {
      const IconComponent = icon as LucideIcon
      return <IconComponent className={iconClassName} />
    }
    return <div className={iconClassName}>{icon}</div>
  }

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 ${className}`}
    >
      <CardContent className="p-6">
        {/* Header: Icon + Title sur la même ligne */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {renderIcon()}
            <h3 className={titleClassName}>{title}</h3>
          </div>
        </div>

        {/* Stats en colonne */}
        <div className="space-y-3">
          {/* Total */}
          <div className="flex flex-col">
            <span className={totalClassName}>{total.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>

          {/* Active/Inactive si fournis */}
          {(active !== undefined || inactive !== undefined) && (
            <div className="flex justify-between space-x-4">
              {active !== undefined && (
                <div className="flex flex-col">
                  <span className={activeClassName}>
                    {active.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">Actif</span>
                </div>
              )}

              {inactive !== undefined && (
                <div className="flex flex-col">
                  <span className={inactiveClassName}>
                    {inactive.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">Inactif</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Composant pour une grille de cards
export function DashboardCardsGrid({
  cards,
  gridCols = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },
  className = "",
}: DashboardCardsGridProps) {
  // Génération des classes CSS pour la grille
  const getGridClasses = () => {
    const classes = ["grid", "gap-6"]
    if (gridCols.sm) classes.push(`grid-cols-${gridCols.sm}`)
    if (gridCols.md) classes.push(`md:grid-cols-${gridCols.md}`)
    if (gridCols.lg) classes.push(`lg:grid-cols-${gridCols.lg}`)
    if (gridCols.xl) classes.push(`xl:grid-cols-${gridCols.xl}`)
    return classes.join(" ")
  }

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {cards.map((card, index) => (
        <DashboardCard key={index} {...card} />
      ))}
    </div>
  )
}

// Export par défaut du composant principal
export default DashboardCard
