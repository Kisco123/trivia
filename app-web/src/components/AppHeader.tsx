"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mascot } from "@/components/Mascot";

/** Header con el ícono de la app que vuelve al inicio.
 *  Se oculta en la home (ahí ya estás en el inicio). */
export function AppHeader() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <header className="flex items-center py-3">
      <Link
        href="/"
        aria-label="Volver al inicio"
        className="flex items-center gap-2 transition active:scale-95"
      >
        <Mascot expression="neutral" size={36} />
        <span className="text-sm font-extrabold tracking-tight">Trivia</span>
      </Link>
    </header>
  );
}
