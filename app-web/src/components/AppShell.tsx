import { ReactNode } from "react";

/** Contenedor mobile-first: centra el contenido en una columna de ancho de celular. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full flex justify-center">
      <div className="relative w-full max-w-[420px] min-h-dvh flex flex-col px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        {children}
      </div>
    </div>
  );
}
