import { AppSidebar } from "@/components/app-sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
