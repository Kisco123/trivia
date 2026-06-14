"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ensureSession, getDisplayName } from "@/lib/auth";
import { getMyGroups, createGroup, joinGroup } from "@/lib/groups";
import type { Group } from "@/lib/groups";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Mascot } from "@/components/Mascot";

export function GroupsLobby() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Create group state
  const [showCreate, setShowCreate] = useState(false);
  const [createInput, setCreateInput] = useState("");
  const [creating, setCreating] = useState(false);

  // Join group state
  const [showJoin, setShowJoin] = useState(false);
  const [joinInput, setJoinInput] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Copied code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function loadGroups() {
    await ensureSession();
    const list = await getMyGroups();
    setGroups(list);
  }

  useEffect(() => {
    loadGroups().finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    const name = createInput.trim();
    if (!name) return;
    setCreating(true);
    try {
      const displayName = (await getDisplayName()) ?? "Jugador";
      await createGroup(name, displayName);
      setCreateInput("");
      setShowCreate(false);
      await loadGroups();
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin() {
    const code = joinInput.trim().toUpperCase();
    if (!code) return;
    setJoining(true);
    setJoinError(null);
    try {
      const displayName = (await getDisplayName()) ?? "Jugador";
      await joinGroup(code, displayName);
      setJoinInput("");
      setShowJoin(false);
      await loadGroups();
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Código inválido");
    } finally {
      setJoining(false);
    }
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1500);
    });
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-white/60">
        Cargando…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Tus grupos</h1>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <Mascot expression="neutral" size={72} />
          <p className="text-sm text-white/60">
            Aún no tienes grupos. Crea uno o únete con un código.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((g) => (
            <Link key={g.id} href={`/grupos/${g.id}`} className="block">
              <Card className="flex items-center justify-between gap-3">
                <span className="font-bold">{g.name}</span>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg border border-white/10 bg-white/[0.06] px-2 py-1 font-mono text-xs tracking-widest text-white/80">
                    {g.invite_code}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCopy(g.invite_code);
                    }}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-white/60 transition hover:text-white active:scale-95"
                  >
                    {copiedCode === g.invite_code ? "¡Copiado!" : "Copiar"}
                  </button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        {/* Create group */}
        {!showCreate ? (
          <Button
            variant="primary"
            onClick={() => {
              setShowCreate(true);
              setShowJoin(false);
            }}
          >
            Crear grupo
          </Button>
        ) : (
          <Card className="flex flex-col gap-3">
            <p className="text-sm font-semibold">Nombre del grupo</p>
            <input
              type="text"
              value={createInput}
              onChange={(e) => setCreateInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Ej. Familia, Amigos…"
              maxLength={40}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder-white/30 outline-none focus:border-white/30"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowCreate(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                disabled={!createInput.trim() || creating}
                onClick={handleCreate}
              >
                Crear
              </Button>
            </div>
          </Card>
        )}

        {/* Join group */}
        {!showJoin ? (
          <Button
            variant="secondary"
            onClick={() => {
              setShowJoin(true);
              setShowCreate(false);
            }}
          >
            Unirse con código
          </Button>
        ) : (
          <Card className="flex flex-col gap-3">
            <p className="text-sm font-semibold">Código de invitación</p>
            <input
              type="text"
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="Ej. ABC123"
              maxLength={10}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 font-mono text-white uppercase placeholder-white/30 outline-none focus:border-white/30"
              autoFocus
            />
            {joinError && (
              <p className="text-sm text-red-400">{joinError}</p>
            )}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowJoin(false);
                  setJoinError(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                disabled={!joinInput.trim() || joining}
                onClick={handleJoin}
              >
                Unirse
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
