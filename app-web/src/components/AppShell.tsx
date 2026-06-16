import { ReactNode } from "react";
import { AppHeader } from "@/components/AppHeader";
import { InstallPrompt } from "@/components/InstallPrompt";
import { BottomNav } from "@/components/BottomNav";
import { AuthGate } from "@/components/AuthGate";

/** Contenedor mobile-first: centra el contenido en una columna de ancho de celular.
 *  AuthGate exige cuenta antes de mostrar las funciones (header, contenido y nav). */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full flex justify-center">
      <div className="relative w-full max-w-[420px] min-h-dvh flex flex-col px-4 pb-24 pt-[env(safe-area-inset-top)]">
        <AuthGate>
          <AppHeader />
          {children}
          <InstallPrompt />
          <BottomNav />
        </AuthGate>
      </div>
    </div>
  );
}
