"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

/** CTA de la home. Por ahora el juego no existe (llega en el Plan 3),
 *  así que muestra un mensaje provisional al tocarlo. */
export function PlayCTA() {
  const [tapped, setTapped] = useState(false);

  return (
    <div className="w-full">
      <Button className="w-full" onClick={() => setTapped(true)}>
        Jugar el desafío de hoy
      </Button>
      {tapped && (
        <p className="mt-3 text-sm text-violet-light">
          🦉 El primer desafío llega muy pronto. ¡Lo estamos construyendo!
        </p>
      )}
    </div>
  );
}
