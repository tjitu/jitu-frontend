"use client";

import AdminNavbar from "@/components/elements/AdminNavbar/AdminNavbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { UserWithRole } from "@/lib/types";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending) {
      const user = session?.user as unknown as UserWithRole;
      if (!session) {
        router.push("/login");
      } else if (user?.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const user = session?.user as unknown as UserWithRole;

  // Jika session tidak ada atau role bukan admin, jangan render children (sedang redirect)
  if (!session || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AdminNavbar />
      <SidebarInset className="flex flex-col transition-all duration-300 ease-in-out">
        <main className="flex-1 font-open-sans p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
