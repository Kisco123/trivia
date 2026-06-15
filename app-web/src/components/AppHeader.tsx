"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Mascot } from "@/components/Mascot";

/** Header de cada sección: una flecha ← que vuelve a la página anterior, y el
 *  búho que va directo al inicio. Se oculta en la home (ya estás en el inicio). */
export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/") return null;

  return (
    <header className="flex items-center gap-2 py-3">
      <button
        onClick={() => router.back()}
        aria-label="Volver"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-lg text-white/70 transition hover:text-white active:scale-95"
      >
        ←
      </button>
      <Link
        href="/"
        aria-label="Inicio"
        className="flex items-center gap-2 transition active:scale-95"
      >
        <Mascot expression="neutral" size={32} />
        <span className="text-sm font-extrabold tracking-tight">Trivia</span>
      </Link>
    </header>
  );
}
