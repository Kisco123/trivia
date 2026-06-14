"use client";

import { DisplayNameGate } from "@/components/groups/DisplayNameGate";
import { GroupsLobby } from "@/components/groups/GroupsLobby";

export default function GruposPage() {
  return (
    <main className="flex flex-1 flex-col py-6">
      <DisplayNameGate>
        <GroupsLobby />
      </DisplayNameGate>
    </main>
  );
}
