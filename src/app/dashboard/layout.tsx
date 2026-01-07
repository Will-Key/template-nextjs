"use client";

import { StaffAuthProvider } from "@/lib/staff-auth-context";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StaffAuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <DashboardSidebar />
        <main className="md:ml-64 min-h-screen">
          {children}
        </main>
      </div>
      <Toaster position="top-right" />
    </StaffAuthProvider>
  );
}
