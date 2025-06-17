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
  useIsActive,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

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
      requiredProfile: "ADMIN;AGENT;USER",
    },
    {
      title: "Administration",
      url: "#",
      icon: Settings,
      requiredProfile: "ADMIN;AGENT",
      items: [
        {
          title: "Agent",
          url: "/admin/agent",
          requiredProfile: "ADMIN",
        },
        {
          title: "Demande",
          url: "/admin/demand",
          requiredProfile: "ADMIN;AGENT",
        },
        {
          title: "Note de service",
          url: "/admin/note",
          requiredProfile: "ADMIN;AGENT",
        },
      ],
    },
    {
      title: "Site",
      url: "#",
      icon: SquareTerminal,
      requiredProfile: "ADMIN",
      items: [
        {
          title: "Actualité",
          url: "/admin/site/news",
          requiredProfile: "ADMIN",
        },
        {
          title: "Formation",
          url: "/admin/site/formation",
          requiredProfile: "ADMIN",
        },
        {
          title: "Service",
          url: "/admin/site/service",
          requiredProfile: "ADMIN",
        },
      ],
    },
  ],
}

// Fonction utilitaire pour vérifier les permissions
function hasPermission(userProfile: string, requiredProfile: string): boolean {
  const userProfiles = userProfile.split(";")
  const requiredProfiles = requiredProfile.split(";")
  return requiredProfiles.some((profile) => userProfiles.includes(profile))
}

// Composant NavMain optimisé avec détection automatique de l'état actif
function NavMain({
  items,
  userProfile,
}: {
  items: typeof data.navMain
  userProfile: string
}) {
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

            // Utiliser le hook pour détecter l'état actif
            const isMainItemActive = useIsActive(
              item.url !== "#" ? item.url : "",
              false
            )

            // Pour les items avec sous-menus, vérifier si un sous-item est actif
            const hasActiveSubItem =
              hasSubItems &&
              allowedSubItems.some((subItem) => useIsActive(subItem.url, false))

            // Déterminer si le collapsible doit être ouvert par défaut
            const shouldBeOpen = isMainItemActive || hasActiveSubItem

            // Si c'est un item simple (comme Dashboard), utiliser directement SidebarNavButton
            if (!hasSubItems) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarNavButton href={item.url} tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarNavButton>
                </SidebarMenuItem>
              )
            }

            // Pour les items avec sous-menus, utiliser Collapsible
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={shouldBeOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarNavButton
                      href={item.url !== "#" ? item.url : undefined}
                      tooltip={item.title}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarNavButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {allowedSubItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarNavSubButton href={subItem.url}>
                            <span>{subItem.title}</span>
                          </SidebarNavSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} userProfile="ADMIN" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
