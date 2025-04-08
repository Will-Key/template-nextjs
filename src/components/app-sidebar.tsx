"use client";

import * as React from "react";
import { Command, Settings, SquareTerminal } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

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
      title: "Administration",
      url: "#",
      icon: Settings,
      isActive: true,
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
};

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
  );
}
