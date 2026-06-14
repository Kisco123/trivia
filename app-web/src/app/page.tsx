import { Mascot } from "@/components/Mascot";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CATEGORIES } from "@/lib/categories";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 py-10 text-center">
      <Mascot expression="happy" size={88} />

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Trivia</h1>
        <p className="mt-2 text-white/60">
          Una trivia al día. Compite con tu grupo.
        </p>
      </div>

      <Card className="w-full">
        <p className="mb-4 text-sm text-white/70">Categorías de hoy</p>
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.slice(0, 8).map((c) => (
            <div key={c.id} className="flex flex-col items-center gap-1">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
                style={{ backgroundColor: `${c.color}22` }}
              >
                {c.emoji}
              </div>
              <span className="text-[10px] text-white/50">{c.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Button className="w-full">Jugar el desafío de hoy</Button>
    </main>
  );
}
