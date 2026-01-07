"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStaffAuth } from "@/lib/staff-auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  QrCode,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { staff, logout } = useStaffAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!staff) return null;

  const slug = staff.restaurant.slug;

  const navigation = [
    {
      name: "Commandes",
      href: `/dashboard/${slug}`,
      icon: ClipboardList,
      description: "Gérer les commandes",
    },
    {
      name: "Menu",
      href: `/dashboard/${slug}/menu`,
      icon: UtensilsCrossed,
      description: "Gérer le menu",
      roles: ["owner", "cashier"],
    },
    {
      name: "Tables",
      href: `/dashboard/${slug}/tables`,
      icon: LayoutDashboard,
      description: "Gérer les tables",
      roles: ["owner", "cashier"],
    },
    {
      name: "QR Codes",
      href: `/dashboard/${slug}/qrcodes`,
      icon: QrCode,
      description: "Générer les QR codes",
      roles: ["owner"],
    },
    {
      name: "Personnel",
      href: `/dashboard/${slug}/staff`,
      icon: Users,
      description: "Gérer le personnel",
      roles: ["owner"],
    },
    {
      name: "Paramètres",
      href: `/dashboard/${slug}/settings`,
      icon: Settings,
      description: "Paramètres du restaurant",
      roles: ["owner"],
    },
  ];

  // Filtrer selon le rôle
  const filteredNavigation = navigation.filter(
    (item) => !item.roles || item.roles.includes(staff.role)
  );

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Propriétaire";
      case "cashier":
        return "Caissier";
      case "waiter":
        return "Serveur";
      case "kitchen":
        return "Cuisine";
      default:
        return role;
    }
  };

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold truncate">
                  {staff.restaurant.name}
                </h2>
                <p className="text-xs text-muted-foreground">Système de commandes</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-orange-100 text-orange-700">
                  {staff.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{staff.name}</p>
                <Badge variant="outline" className="text-xs">
                  {getRoleLabel(staff.role)}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
