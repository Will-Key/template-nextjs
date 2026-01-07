"use client";

import { StaffAuthProvider } from "@/lib/staff-auth-context";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffAuthProvider>{children}</StaffAuthProvider>;
}
