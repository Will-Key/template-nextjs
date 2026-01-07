import { StaffAuthProvider } from "@/lib/staff-auth-context";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffAuthProvider>{children}</StaffAuthProvider>;
}
