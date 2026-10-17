"use client";

import AdminNavbar from "@/components/elements/AdminNavbar/AdminNavbar";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { UserWithRole } from "@/lib/types";

/**
 * DESIGN.md Section 6.7 — Admin Layout
 * Blue-800 sidebar (desktop) or top menu (phone). Dense and functional, same tokens.
 */
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
      <div className="h-screen w-full bg-blue-50 flex items-center justify-center gap-2 font-mono text-[14px] text-blue-900">
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        <span>Memuat panel admin…</span>
      </div>
    );
  }

  const user = session?.user as unknown as UserWithRole;

  if (!session || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-blue-50 text-blue-900 flex flex-col lg:flex-row">
      <AdminNavbar />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
        <div className="max-w-[1200px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
