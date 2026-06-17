"use client";
import {
  BanknoteIcon,
  CalendarDaysIcon,
  CoinsIcon,
  HomeIcon,
  NotebookPenIcon,
  Sparkles,
  UserIcon,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import BottomNav from "../Navbar/BottomNav";

// Menu items.
const items = [
  {
    title: "Dashboard",
    path: "admin/",
    icon: HomeIcon,
  },
  {
    title: "Kelola Tryout",
    path: "admin/tryout",
    icon: NotebookPenIcon,
  },
  {
    title: "AI Generator",
    path: "admin/ai-generator",
    icon: Sparkles,
  },
  {
    title: "Kelola User",
    path: "admin/user",
    icon: UserIcon,
  },
  {
    title: "Kelola Pembayaran",
    path: "admin/payments",
    icon: BanknoteIcon,
  },
  {
    title: "Kelola Paket Token",
    path: "admin/packages",
    icon: CoinsIcon,
  },
  {
    title: "Kelola Daily Question",
    path: "admin/daily",
    icon: CalendarDaysIcon,
  },
];

const AdminNavbar = () => {
  const path = usePathname();
  const router = useRouter();
  const { open, setOpen } = useSidebar();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  // Bersihkan teks "Kelola" khusus untuk BottomNav agar tidak terlalu padat di mobile
  const bottomNavItems = items.map((item) => ({
    ...item,
    title: item.title.replace("Kelola ", ""),
  }));

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <BottomNav items={bottomNavItems} className="md:hidden" />

      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full z-40">
        <Sidebar
          collapsible="icon"
          onMouseOver={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="z-40"
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem className="mt-2 mb-6">
                    <SidebarMenuButton>
                      <Image
                        src="/logo.png"
                        alt="logo"
                        width={48}
                        height={48}
                        priority
                      />
                      <span className="text-2xl font-bold text-neutral-800">
                        JituPTN
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {items.map((item) => {
                    const isPath = path.endsWith(item.path);

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <button
                            onClick={() => router.push(`/${item.path}`)}
                            aria-disabled={isPath}
                            className={`${
                              isPath
                                ? "opacity-100!"
                                : "hover:bg-neutral-500/20 transition-colors text-neutral-700"
                            }`}
                          >
                            <div
                              className={`${
                                isPath
                                  ? "border-2 border-primary-300 bg-primary-100/30 text-primary-300"
                                  : ""
                              } w-12 flex justify-center items-center rounded-xl`}
                            >
                              <item.icon />
                            </div>
                            <span className="text-base font-semibold">
                              {item.title}
                            </span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <div
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                    open ? "bg-muted/50 border shadow-xs" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm">
                    <AvatarImage
                      src={session?.user?.image || ""}
                      alt={session?.user?.name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {session?.user?.name?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  {open && (
                    <div className="flex-1 min-w-0 overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
                      <p className="text-sm font-bold text-foreground truncate">
                        {session?.user?.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate uppercase font-medium tracking-tighter">
                        {session?.user?.email}
                      </p>
                    </div>
                  )}
                  {open && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                      title="Kelola & Logout"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {!open && (
                  <button
                    onClick={handleLogout}
                    className="w-full flex justify-center py-3 text-red-500 hover:text-red-600 transition-colors"
                    title="Keluar Akun"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </div>
    </>
  );
};

export default AdminNavbar;
