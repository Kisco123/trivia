"use client";

import { useParams } from "next/navigation";
import { DisplayNameGate } from "@/components/groups/DisplayNameGate";
import { AutoJoinGroup } from "@/components/groups/AutoJoinGroup";

export default function UnirsePage() {
  const params = useParams();
  const code = params.code as string;

  return (
    <main className="flex flex-1 flex-col py-6">
      <DisplayNameGate>
        <AutoJoinGroup code={code} />
      </DisplayNameGate>
    </main>
  );
}
