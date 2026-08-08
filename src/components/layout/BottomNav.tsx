"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, LibraryBig, Heart, User } from "lucide-react";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/coleccion", label: "Colección", icon: LayoutGrid },
  { href: "/catalogo", label: "Catálogo", icon: LibraryBig },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-900/[0.06] bg-white/95 backdrop-blur safe-bottom md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const isAddButton = href === "/catalogo";

          if (isAddButton) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5"
                aria-label={label}
              >
                <span
                  className={cn(
                    "flex h-11 w-11 -translate-y-2 items-center justify-center rounded-full shadow-card-hover transition",
                    active ? "bg-accent-600" : "bg-accent-500"
                  )}
                >
                  <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5"
              aria-label={label}
            >
              <Icon
                className={cn("h-5 w-5", active ? "text-accent-600" : "text-ink-300")}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className={cn("text-[11px] font-medium", active ? "text-accent-600" : "text-ink-300")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
