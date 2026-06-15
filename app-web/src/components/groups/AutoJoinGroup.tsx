"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDisplayName } from "@/lib/auth";
import { joinGroup } from "@/lib/groups";
import { Mascot } from "@/components/Mascot";

export function AutoJoinGroup({ code }: { code: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const name = (await getDisplayName()) ?? "Jugador";
        const group = await joinGroup(code, name);
        if (!cancelled) router.replace(`/grupos/${group.id}`);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "No se pudo unir al grupo");
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <Mascot expression="sad" size={64} />
        <p className="text-sm text-red-400">{error}</p>
        <Link
          href="/grupos"
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-white/70 transition hover:text-white"
        >
          Ir a mis grupos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <Mascot expression="thinking" size={64} />
      <p className="text-white/60">Uniéndote al grupo…</p>
    </div>
  );
}
