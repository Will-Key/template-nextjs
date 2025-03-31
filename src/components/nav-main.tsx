"use client"

import { ChevronRight, LayoutDashboard, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavMain({
  items,
  userProfile
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    requiredProfile: string
    items?: {
      title: string
      url: string
      requiredProfile: string
    }[]
  }[],
  userProfile: string
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Tableau de bord"
              >
                <LayoutDashboard />
                <Link href="#">Tableau de bord</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
      <SidebarMenu>
        {items.map((item) => (
          item.requiredProfile.includes(userProfile) && <Collapsible
          key={item.title}
          asChild
          defaultOpen={item.isActive}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild>
                      <Link href={subItem.url}>
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
