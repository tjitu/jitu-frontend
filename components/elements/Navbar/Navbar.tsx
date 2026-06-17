"use client";
import {
  Home,
  ShoppingBag,
  NotebookPen,
  Flame,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { signOut } from "@/lib/auth-client";
import BottomNav from "./BottomNav";

// Menu items.
const items = [
  {
    title: "Dashboard",
    path: "dashboard",
    icon: Home,
  },
  {
    title: "Daily Streak",
    path: "daily-streak",
    icon: Flame,
  },
  {
    title: "Tryout",
    path: "tryout",
    icon: NotebookPen,
  },
  {
    title: "Shop",
    path: "shop",
    icon: ShoppingBag,
  },
];

const Navbar = () => {
  const path = usePathname();
  const router = useRouter();
  const { setOpen } = useSidebar();

  const state =
    items.find((item) => path.startsWith(`/${item.path}`)) ?? items[0];
  const hidden = ["/login", "/register", "/admin"];
  const isExamPage = path.includes("/exam/");

  if (hidden.includes(path) || isExamPage) {
    return null;
  }

  // Add Profile to BottomNav items for mobile accessibility
  const bottomNavItems = [
    ...items,
    {
      title: "Profil",
      path: "profile",
      icon: User,
    },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <BottomNav items={bottomNavItems} className="md:hidden" />

      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full z-40">
        <Sidebar
          className="h-full border-r border-gray-200"
          collapsible="icon"
          onMouseOver={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* --- LOGO ORIGINAL (KEMBALI KE ASAL) --- */}
                  <SidebarMenuItem className="mt-2 mb-6">
                    <SidebarMenuButton className="hover:bg-transparent active:bg-transparent">
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

                  {/* --- MENU ITEMS (STYLE ORIGINAL) --- */}
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
                              } w-12 flex justify-center items-center rounded-xl transition-all`}
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
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => router.push("/profile")}
                    className="hover:bg-neutral-500/20 transition-colors text-neutral-700"
                  >
                    <div className="w-12 flex justify-center items-center rounded-xl">
                      <User />
                    </div>
                    <span className="text-base font-semibold">Profil</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={async () => {
                      await signOut({
                        fetchOptions: {
                          onSuccess: () => router.push("/login"),
                        },
                      });
                    }}
                    className="hover:bg-red-50 transition-colors text-red-600"
                  >
                    <div className="w-12 flex justify-center items-center rounded-xl">
                      <LogOut />
                    </div>
                    <span className="text-base font-semibold">Keluar</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </div>
    </>
  );
};

export default Navbar;
