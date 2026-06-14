"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function PlayCTA() {
  const router = useRouter();
  return (
    <Button className="w-full" onClick={() => router.push("/jugar")}>
      Jugar el desafío de hoy
    </Button>
  );
}
