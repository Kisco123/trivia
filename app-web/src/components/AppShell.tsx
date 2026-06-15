import { ReactNode } from "react";
import { AppHeader } from "@/components/AppHeader";

/** Contenedor mobile-first: centra el contenido en una columna de ancho de celular.
 *  Incluye un header con el ícono de la app que vuelve al inicio (oculto en la home). */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full flex justify-center">
      <div className="relative w-full max-w-[420px] min-h-dvh flex flex-col px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        <AppHeader />
        {children}
      </div>
    </div>
  );
}
