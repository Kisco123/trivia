"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/grupos", label: "Grupos", icon: "👥" },
  { href: "/perfil", label: "Perfil", icon: "📊" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname() || "/";

  // Se oculta en pantallas inmersivas (jugar) y en el flujo de unirse.
  if (pathname.startsWith("/jugar") || pathname.startsWith("/unirse")) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[420px] -translate-x-1/2 border-t border-white/10 bg-bg-elevated/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="flex">
        {TABS.map((t) => {
          const active = isActive(pathname, t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition ${
                active ? "text-violet-light" : "text-white/50 hover:text-white/80"
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
