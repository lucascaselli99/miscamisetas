"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  PlusCircle,
  Heart,
  User,
  BarChart3,
  LibraryBig,
  ShieldPlus,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/useAuth";

const BASE_NAV_ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/coleccion", label: "Colección", icon: LayoutGrid },
  { href: "/catalogo", label: "Catálogo", icon: LibraryBig },
] as const;

const END_NAV_ITEMS = [
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/estadisticas", label: "Estadísticas", icon: BarChart3 },
  { href: "/perfil", label: "Perfil", icon: User },
] as const;

/** Navegación lateral para tablet/desktop. */
export function SideNav() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const middleItems = isAdmin
    ? [
        { href: "/admin/catalogo", label: "Agregar al catálogo", icon: ShieldPlus },
        { href: "/agregar", label: "Agregar a mi colección", icon: PlusCircle },
      ]
    : [{ href: "/agregar", label: "Agregar camiseta", icon: PlusCircle }];

  const items = [...BASE_NAV_ITEMS, ...middleItems, ...END_NAV_ITEMS];

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-ink-900/[0.06] bg-white px-4 py-6 md:flex">
      <div className="mb-8 px-2">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-accent-50 text-accent-700" : "text-ink-700 hover:bg-cream-100"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
