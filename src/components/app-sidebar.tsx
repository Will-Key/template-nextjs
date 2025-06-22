"use client"

import * as React from "react"
import {
  Command,
  Settings,
  SquareTerminal,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
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

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "SSISPRO",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      requiredProfile: "ADMIN;AGENT;super_admin",
    },
    {
      title: "Administration",
      url: "#",
      icon: Settings,
      requiredProfile: "ADMIN;AGENT;super_admin",
      items: [
        {
          title: "Agent",
          url: "/admin/agent",
          requiredProfile: "ADMIN;super_admin",
        },
        {
          title: "Documents",
          url: "/admin/docs",
          requiredProfile: "ADMIN;AGENT;super_admin",
        },
      ],
    },
    {
      title: "Site",
      url: "#",
      icon: SquareTerminal,
      requiredProfile: "admin;super_admin",
      items: [
        {
          title: "Actualité",
          url: "/admin/site/news",
          requiredProfile: "admin;super_admin",
        },
        {
          title: "Formation",
          url: "/admin/site/formation",
          requiredProfile: "admin;super_admin",
        },
        {
          title: "Service",
          url: "/admin/site/service",
          requiredProfile: "admin;super_admin",
        },
      ],
    },
  ],
}

// Fonction utilitaire pour vérifier les permissions
function hasPermission(
  userProfile: string | undefined,
  requiredProfile: string
): boolean {
  const userProfiles = userProfile?.toLowerCase()?.split(";")
  const requiredProfiles = requiredProfile?.toLowerCase().split(";")
  return requiredProfiles.some((profile) =>
    userProfiles?.includes(profile?.toLowerCase())
  )
}

// Hook personnalisé pour vérifier si une URL est active
// function useIsActive(url: string, exact: boolean = false): boolean {
//   const pathname = usePathname()

//   if (!url || url === "#") return false

//   if (exact) {
//     return pathname === url
//   }

//   return pathname.startsWith(url)
// }

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

  // ✅ Fonction utilitaire pour vérifier l'état actif
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

  // ✅ Calculer les états actifs avec la fonction utilitaire
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

// Composant NavMain optimisé avec hooks appelés correctement
function NavMain({
  items,
  userProfile,
}: {
  items: typeof data.navMain
  userProfile: string | undefined
}) {
  // ✅ Hook appelé une seule fois au début du composant
  const pathname = usePathname()

  // ✅ Fonction utilitaire qui n'utilise pas de hooks
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
            // Vérifier si l'utilisateur a les permissions pour voir cet item
            if (!hasPermission(userProfile, item.requiredProfile)) {
              return null
            }

            // Filtrer les sous-items selon les permissions
            const allowedSubItems =
              item.items?.filter((subItem) =>
                hasPermission(userProfile, subItem.requiredProfile)
              ) || []

            // Détecter si c'est un item avec sous-menus
            const hasSubItems = allowedSubItems.length > 0

            // ✅ Utiliser la fonction utilitaire au lieu du hook
            const isMainItemActive = isUrlActive(
              item.url !== "#" ? item.url : "",
              false
            )

            // Pour les items avec sous-menus, vérifier si un sous-item est actif
            const hasActiveSubItem =
              hasSubItems &&
              allowedSubItems.some((subItem) => isUrlActive(subItem.url, false))

            // Si c'est un item simple (comme Dashboard)
            if (!hasSubItems) {
              return (
                <SimpleNavItem
                  key={item.title}
                  item={item}
                  isActive={isMainItemActive}
                />
              )
            }

            // Pour les items avec sous-menus
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
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} userProfile={user?.role} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onClick={logout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
