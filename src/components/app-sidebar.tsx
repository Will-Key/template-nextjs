"use client"

import * as React from "react"
import {
  Settings,
  Users,
  ChevronRight,
  LayoutDashboard,
  Home,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarNavButton,
  SidebarNavSubButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth/AuthContext"

// Configuration de la navigation - À personnaliser selon vos besoins
const data = {
  navMain: [
    {
      title: "Accueil",
      url: "/",
      icon: Home,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Utilisateurs",
      url: "/dashboard/users",
      icon: Users,
      requiredRole: "admin",
    },
    {
      title: "Paramètres",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Profil",
          url: "/dashboard/settings/profile",
        },
        {
          title: "Préférences",
          url: "/dashboard/settings/preferences",
        },
      ],
    },
  ],
}

// Fonction utilitaire pour vérifier les permissions par rôle
function hasRole(userRole: string | undefined, requiredRole?: string): boolean {
  if (!requiredRole) return true
  if (!userRole) return false
  
  // L'admin a accès à tout
  if (userRole === 'admin') return true
  
  const requiredRoles = requiredRole.toLowerCase().split(";")
  return requiredRoles.includes(userRole.toLowerCase())
}

// Composant pour un item de navigation simple
function SimpleNavItem({
  item,
  isActive,
}: {
  item: (typeof data.navMain)[0]
  isActive: boolean
}) {
  return (
    <SidebarMenuItem>
      <SidebarNavButton
        href={item.url}
        tooltip={item.title}
        isActive={isActive}
      >
        {item.icon && <item.icon />}
        <span>{item.title}</span>
      </SidebarNavButton>
    </SidebarMenuItem>
  )
}

// Composant pour un item de navigation avec sous-menus
function CollapsibleNavItem({
  item,
  allowedSubItems,
  isMainItemActive,
  hasActiveSubItem,
}: {
  item: (typeof data.navMain)[0]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allowedSubItems: any[]
  isMainItemActive: boolean
  hasActiveSubItem: boolean
}) {
  const shouldBeOpen = isMainItemActive || hasActiveSubItem
  const pathname = usePathname()

  const isUrlActive = React.useCallback(
    (url: string, exact: boolean = false): boolean => {
      if (!url || url === "#") return false
      if (exact) {
        return pathname === url
      }
      return pathname.startsWith(url)
    },
    [pathname]
  )

  const subItemsActiveStates = React.useMemo(
    () =>
      allowedSubItems.map((subItem) => ({
        ...subItem,
        isActive: isUrlActive(subItem.url, false),
      })),
    [allowedSubItems, isUrlActive]
  )

  return (
    <Collapsible
      asChild
      defaultOpen={shouldBeOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarNavButton
            href={item.url !== "#" ? item.url : undefined}
            tooltip={item.title}
            isActive={isMainItemActive}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarNavButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            {subItemsActiveStates.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarNavSubButton
                  href={subItem.url}
                  isActive={subItem.isActive}
                >
                  <span>{subItem.title}</span>
                </SidebarNavSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

// Composant NavMain
function NavMain({
  items,
  userRole,
}: {
  items: typeof data.navMain
  userRole: string | undefined
}) {
  const pathname = usePathname()

  const isUrlActive = React.useCallback(
    (url: string, exact: boolean = false): boolean => {
      if (!url || url === "#") return false
      if (exact) {
        return pathname === url
      }
      return pathname.startsWith(url)
    },
    [pathname]
  )

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            // Vérifier si l'utilisateur a le rôle requis
            if (!hasRole(userRole, item.requiredRole)) {
              return null
            }

            // Filtrer les sous-items selon les permissions
            const allowedSubItems =
              item.items?.filter((subItem) =>
                hasRole(userRole, subItem.requiredRole)
              ) || []

            const hasSubItems = allowedSubItems.length > 0
            const isMainItemActive = isUrlActive(
              item.url !== "#" ? item.url : "",
              false
            )
            const hasActiveSubItem =
              hasSubItems &&
              allowedSubItems.some((subItem) => isUrlActive(subItem.url, false))

            if (!hasSubItems) {
              return (
                <SimpleNavItem
                  key={item.title}
                  item={item}
                  isActive={isMainItemActive}
                />
              )
            }

            return (
              <CollapsibleNavItem
                key={item.title}
                item={item}
                allowedSubItems={allowedSubItems}
                isMainItemActive={isMainItemActive}
                hasActiveSubItem={hasActiveSubItem}
              />
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth()
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <span className="font-semibold text-lg">My App</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} userRole={user?.role} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onClick={logout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
