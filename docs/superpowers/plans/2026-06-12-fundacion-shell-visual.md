# Plan 1 — Fundación + Shell Visual (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tener una PWA Next.js desplegable en Cloudflare, instalable en el celular, conectada a Supabase, con el sistema de diseño "editorial vivo" (paleta oscura, mascota búho, iconos de categoría, componentes base) y una pantalla de inicio que muestra la identidad visual.

**Architecture:** App Next.js (App Router, TypeScript) mobile-first servida como PWA. Estilos con Tailwind usando design tokens centralizados. Componentes UI reutilizables y sin estado para la capa visual. Supabase como BaaS (solo se cablea el cliente en este plan; las tablas llegan en planes posteriores). Deploy en Cloudflare Pages/Workers vía el adapter `@opennextjs/cloudflare`.

**Tech Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion · Supabase JS · Vitest + React Testing Library · `@opennextjs/cloudflare` + Wrangler.

> **Nota de versiones:** este plan fija comandos con las versiones estables a junio 2026. Si un paquete cambió de API, ajustar siguiendo el error y la doc oficial; los pasos de verificación detectan el problema. Gestor de paquetes: **pnpm** (si no está, `npm i -g pnpm`).

> **Convención de testing:** se usa TDD real en la lógica con comportamiento (mapeo de expresiones de la mascota, lookup de categorías). En los pasos de **configuración/scaffold** (Tailwind, PWA, deploy) el "test" es un comando de verificación explícito (build pasa, ruta renderiza, manifest válido), porque ahí no hay lógica que aislar. Cada paso dice exactamente qué correr y qué esperar.

---

## Prerrequisitos (hacer una vez, antes de la Task 1)

- [ ] **P1: Verificar herramientas base**

Run:
```bash
node --version   # >= 20
git --version
pnpm --version || npm i -g pnpm
```
Expected: Node 20+, git presente, pnpm disponible.

- [ ] **P2: Crear proyecto Supabase**

1. Entrar a https://supabase.com → New Project (nombre: `trivia`, región más cercana: South America (São Paulo)).
2. Guardar de **Project Settings → API**: `Project URL` y `anon public key`.
3. (No se crean tablas aún; eso es el Plan 2/4.)

Expected: tener a mano `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

- [ ] **P3: Verificar cuenta Cloudflare**

1. Tener cuenta en https://dash.cloudflare.com.
2. Instalar Wrangler y loguear:
```bash
pnpm dlx wrangler login
```
Expected: navegador abre, autorizás, terminal dice "Successfully logged in".

---

## Task 1: Scaffold del proyecto Next.js + TypeScript

**Files:**
- Create: todo el árbol base del proyecto en `C:\Users\franc\OneDrive\Importantes\04 Proyectos\Trivia\app-web\` (subcarpeta para no mezclar con `docs/`)

> El proyecto vive en `app-web/` dentro del repo `Trivia`. Todos los paths siguientes son relativos a `app-web/`.

- [ ] **Step 1: Crear la app Next con el wizard**

Run (desde `04 Proyectos/Trivia`):
```bash
pnpm create next-app@latest app-web --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```
Responder a cualquier prompt restante con los defaults.

- [ ] **Step 2: Verificar que arranca**

Run:
```bash
cd app-web && pnpm dev
```
Expected: server en http://localhost:3000, página default de Next visible. Cortar con Ctrl+C.

- [ ] **Step 3: Limpiar el boilerplate**

Reemplazar `src/app/page.tsx` por:
```tsx
export default function Home() {
  return <main className="p-6">Trivia — en construcción</main>;
}
```
Vaciar `src/app/globals.css` dejando solo las directivas de Tailwind:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Verificar build de producción**

Run:
```bash
pnpm build
```
Expected: build termina sin errores ("Compiled successfully").

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/franc/OneDrive/Importantes/04 Proyectos/Trivia"
git add -A
git commit -m "feat: scaffold Next.js app en app-web/"
```

---

## Task 2: Setup de testing (Vitest + React Testing Library)

**Files:**
- Create: `app-web/vitest.config.ts`
- Create: `app-web/vitest.setup.ts`
- Modify: `app-web/package.json` (script `test`)
- Test: `app-web/src/lib/__tests__/smoke.test.ts`

- [ ] **Step 1: Instalar dependencias de test**

Run (en `app-web/`):
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

- [ ] **Step 2: Crear configuración de Vitest**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

Create `vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Añadir script de test**

En `package.json`, dentro de `"scripts"`, añadir:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Escribir un smoke test que falla**

Create `src/lib/__tests__/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { ping } from "@/lib/ping";

describe("ping", () => {
  it("returns pong", () => {
    expect(ping()).toBe("pong");
  });
});
```

- [ ] **Step 5: Correr y verificar que falla**

Run: `pnpm test`
Expected: FAIL — no existe `@/lib/ping`.

- [ ] **Step 6: Implementación mínima**

Create `src/lib/ping.ts`:
```ts
export function ping(): string {
  return "pong";
}
```

- [ ] **Step 7: Correr y verificar que pasa**

Run: `pnpm test`
Expected: PASS (1 test).

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "test: configura Vitest + RTL"
```

---

## Task 3: Design tokens (paleta y tema)

**Files:**
- Create: `app-web/src/styles/tokens.ts`
- Modify: `app-web/tailwind.config.ts`
- Test: `app-web/src/styles/__tests__/tokens.test.ts`

- [ ] **Step 1: Test de los tokens**

Create `src/styles/__tests__/tokens.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { colors } from "@/styles/tokens";

describe("design tokens", () => {
  it("expone la paleta core con valores hex", () => {
    expect(colors.bg).toBe("#0a0e1a");
    expect(colors.violet).toBe("#7c5cff");
    expect(colors.orange).toBe("#ff8a4c");
    expect(colors.success).toBe("#4ade80");
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `pnpm test src/styles`
Expected: FAIL — no existe `@/styles/tokens`.

- [ ] **Step 3: Implementar tokens**

Create `src/styles/tokens.ts`:
```ts
// Fuente única de verdad de la paleta "editorial vivo".
export const colors = {
  bg: "#0a0e1a",
  bgElevated: "#0f1320",
  violet: "#7c5cff",
  violetLight: "#b794ff",
  orange: "#ff8a4c",
  magenta: "#ff3d8b",
  success: "#4ade80",
  successDeep: "#22d3a4",
  danger: "#ef4444",
  textPrimary: "#ffffff",
  textSecondary: "#cdd6e0",
  textMuted: "#94a3b8",
} as const;

export type ColorToken = keyof typeof colors;
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `pnpm test src/styles`
Expected: PASS.

- [ ] **Step 5: Cablear tokens en Tailwind**

Reemplazar el contenido de `tailwind.config.ts` por:
```ts
import type { Config } from "tailwindcss";
import { colors } from "./src/styles/tokens";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: colors.bg,
        "bg-elevated": colors.bgElevated,
        violet: { DEFAULT: colors.violet, light: colors.violetLight },
        orange: colors.orange,
        magenta: colors.magenta,
        success: { DEFAULT: colors.success, deep: colors.successDeep },
        danger: colors.danger,
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Verificar que el build sigue compilando**

Run: `pnpm build`
Expected: "Compiled successfully".

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: design tokens + tema Tailwind"
```

---

## Task 4: Fondo de la app y layout mobile-first

**Files:**
- Modify: `app-web/src/app/layout.tsx`
- Modify: `app-web/src/app/globals.css`
- Create: `app-web/src/components/AppShell.tsx`
- Test: `app-web/src/components/__tests__/AppShell.test.tsx`

- [ ] **Step 1: Test del shell**

Create `src/components/__tests__/AppShell.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppShell } from "@/components/AppShell";

describe("AppShell", () => {
  it("renderiza children dentro de un contenedor mobile", () => {
    render(<AppShell><p>hola</p></AppShell>);
    expect(screen.getByText("hola")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `pnpm test src/components`
Expected: FAIL — no existe `AppShell`.

- [ ] **Step 3: Implementar AppShell**

Create `src/components/AppShell.tsx`:
```tsx
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
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `pnpm test src/components`
Expected: PASS.

- [ ] **Step 5: Fondo "editorial vivo" global**

Añadir al final de `src/app/globals.css`:
```css
:root {
  color-scheme: dark;
}

body {
  background-color: #0a0e1a;
  background-image:
    radial-gradient(circle at 15% 8%, rgba(124, 92, 255, 0.22), transparent 45%),
    radial-gradient(circle at 90% 92%, rgba(255, 138, 76, 0.16), transparent 45%),
    linear-gradient(180deg, #0a0e1a 0%, #0f1320 100%);
  background-attachment: fixed;
  color: #fff;
  min-height: 100dvh;
}
```

- [ ] **Step 6: Usar AppShell en el layout raíz**

Reemplazar `src/app/layout.tsx` por:
```tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Trivia",
  description: "Trivia diaria con tu grupo",
};

export const viewport: Viewport = {
  themeColor: "#0a0e1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Verificación visual**

Run: `pnpm dev` y abrir http://localhost:3000 en el navegador, modo responsive ~390px.
Expected: fondo oscuro con gradientes violeta/naranja, texto "Trivia — en construcción" centrado en columna angosta.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: shell mobile-first + fondo editorial vivo"
```

---

## Task 5: Config de categorías (icono + color)

**Files:**
- Create: `app-web/src/lib/categories.ts`
- Test: `app-web/src/lib/__tests__/categories.test.ts`

- [ ] **Step 1: Test de categorías**

Create `src/lib/__tests__/categories.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { CATEGORIES, getCategory } from "@/lib/categories";

describe("categories", () => {
  it("cada categoría tiene id, label, emoji y color", () => {
    for (const c of CATEGORIES) {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(c.emoji).toBeTruthy();
      expect(c.color).toMatch(/^#/);
    }
  });

  it("getCategory devuelve la categoría por id", () => {
    expect(getCategory("historia").label).toBe("Historia");
  });

  it("getCategory hace fallback a 'general' si no existe", () => {
    expect(getCategory("inexistente").id).toBe("general");
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `pnpm test src/lib/__tests__/categories`
Expected: FAIL — no existe `@/lib/categories`.

- [ ] **Step 3: Implementar categorías**

Create `src/lib/categories.ts`:
```ts
export type Category = {
  id: string;
  label: string;
  emoji: string;
  color: string;
};

export const CATEGORIES: Category[] = [
  { id: "general", label: "Cultura general", emoji: "🧠", color: "#7c5cff" },
  { id: "historia", label: "Historia", emoji: "🏛️", color: "#f59e0b" },
  { id: "ciencia", label: "Ciencia", emoji: "🔬", color: "#22d3a4" },
  { id: "geografia", label: "Geografía", emoji: "🌎", color: "#4ade80" },
  { id: "arte", label: "Arte y Literatura", emoji: "🎨", color: "#ff3d8b" },
  { id: "cine", label: "Cine y TV", emoji: "🎬", color: "#ff8a4c" },
  { id: "musica", label: "Música", emoji: "🎵", color: "#b794ff" },
  { id: "deporte", label: "Deporte", emoji: "⚽", color: "#38bdf8" },
];

const byId = new Map(CATEGORIES.map((c) => [c.id, c]));

export function getCategory(id: string): Category {
  return byId.get(id) ?? CATEGORIES[0];
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `pnpm test src/lib/__tests__/categories`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: config de categorías (icono + color)"
```

---

## Task 6: Componente Mascota (búho con expresiones)

**Files:**
- Create: `app-web/src/components/Mascot.tsx`
- Test: `app-web/src/components/__tests__/Mascot.test.tsx`

> En V1 la mascota es un placeholder con emoji por expresión; en producción se reemplaza la fuente de imagen sin cambiar la interfaz del componente.

- [ ] **Step 1: Test de la mascota**

Create `src/components/__tests__/Mascot.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Mascot } from "@/components/Mascot";

describe("Mascot", () => {
  it("muestra la expresión por defecto (neutral)", () => {
    render(<Mascot />);
    expect(screen.getByRole("img", { name: /búho/i })).toHaveTextContent("🦉");
  });

  it("cambia el glyph según la expresión", () => {
    render(<Mascot expression="happy" />);
    expect(screen.getByRole("img", { name: /búho/i })).toHaveTextContent("😄");
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `pnpm test src/components/__tests__/Mascot`
Expected: FAIL — no existe `Mascot`.

- [ ] **Step 3: Implementar la mascota**

Create `src/components/Mascot.tsx`:
```tsx
export type MascotExpression =
  | "neutral"
  | "happy"
  | "surprised"
  | "sad"
  | "victory"
  | "thinking";

const GLYPH: Record<MascotExpression, string> = {
  neutral: "🦉",
  happy: "😄",
  surprised: "😮",
  sad: "😔",
  victory: "🏆",
  thinking: "🤔",
};

export function Mascot({
  expression = "neutral",
  size = 56,
}: {
  expression?: MascotExpression;
  size?: number;
}) {
  return (
    <div
      role="img"
      aria-label="Búho mascota"
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-violet to-violet-light shadow-[0_8px_24px_rgba(124,92,255,0.5)]"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {GLYPH[expression]}
    </div>
  );
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `pnpm test src/components/__tests__/Mascot`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: componente Mascot con expresiones"
```

---

## Task 7: Primitivos UI (Button, Card)

**Files:**
- Create: `app-web/src/components/ui/Button.tsx`
- Create: `app-web/src/components/ui/Card.tsx`
- Test: `app-web/src/components/ui/__tests__/Button.test.tsx`

- [ ] **Step 1: Test del Button**

Create `src/components/ui/__tests__/Button.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renderiza el label y dispara onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Jugar</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Jugar" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("aplica estilo de variante secondary", () => {
    render(<Button variant="secondary">X</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-white/5");
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `pnpm test src/components/ui`
Expected: FAIL — no existe `Button`.

- [ ] **Step 3: Implementar Button**

Create `src/components/ui/Button.tsx`:
```tsx
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-violet to-violet-light text-white shadow-[0_6px_20px_rgba(124,92,255,0.4)]",
  secondary: "bg-white/5 border border-white/10 text-white",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`rounded-2xl px-6 py-3 font-semibold transition active:scale-95 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Implementar Card**

Create `src/components/ui/Card.tsx`:
```tsx
import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.4)] ${className}`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 5: Correr y verificar que pasa**

Run: `pnpm test src/components/ui`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: primitivos UI Button + Card"
```

---

## Task 8: Pantalla de inicio (showcase de identidad visual)

**Files:**
- Modify: `app-web/src/app/page.tsx`
- Create: `app-web/src/app/page.test.tsx`

- [ ] **Step 1: Test de la home**

Create `src/app/page.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home", () => {
  it("muestra el título y un CTA de jugar", () => {
    render(<Home />);
    expect(screen.getByText(/trivia/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /jugar/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `pnpm test src/app/page`
Expected: FAIL — la home actual no tiene botón "Jugar".

- [ ] **Step 3: Implementar la home**

Reemplazar `src/app/page.tsx` por:
```tsx
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
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `pnpm test src/app/page`
Expected: PASS.

- [ ] **Step 5: Verificación visual completa**

Run: `pnpm dev` → http://localhost:3000 en viewport ~390px.
Expected: mascota arriba, título "Trivia", card con grilla de 8 categorías coloreadas, botón violeta full-width. Todo sobre el fondo con gradientes.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: home con showcase de identidad visual"
```

---

## Task 9: Cliente Supabase

**Files:**
- Create: `app-web/.env.local`
- Create: `app-web/.env.example`
- Create: `app-web/src/lib/supabase.ts`
- Test: `app-web/src/lib/__tests__/supabase.test.ts`

- [ ] **Step 1: Instalar el SDK**

Run: `pnpm add @supabase/supabase-js`

- [ ] **Step 2: Variables de entorno**

Create `.env.local` (con los valores reales de P2):
```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU-ANON-KEY
```

Create `.env.example` (sin secretos, se commitea):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Verificar que `.env.local` esté ignorado (el `.gitignore` de Next ya incluye `.env*`); confirmar con:
```bash
git check-ignore app-web/.env.local
```
Expected: imprime la ruta (está ignorado).

- [ ] **Step 3: Test del cliente**

Create `src/lib/__tests__/supabase.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";

describe("getSupabaseClient", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "demo-key";
  });

  it("crea un cliente con método from()", async () => {
    const { getSupabaseClient } = await import("@/lib/supabase");
    const client = getSupabaseClient();
    expect(typeof client.from).toBe("function");
  });

  it("lanza error claro si faltan envs", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const mod = await import("@/lib/supabase");
    expect(() => mod.getSupabaseClient()).toThrow(/SUPABASE_URL/);
  });
});
```

- [ ] **Step 4: Correr y verificar que falla**

Run: `pnpm test src/lib/__tests__/supabase`
Expected: FAIL — no existe `@/lib/supabase`.

- [ ] **Step 5: Implementar el cliente**

Create `src/lib/supabase.ts`:
```ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Falta NEXT_PUBLIC_SUPABASE_ANON_KEY");

  cached = createClient(url, key);
  return cached;
}
```

> Nota: el cliente se cachea por módulo. En el test el segundo caso usa un `import` fresco; si el cache interfiere, el test de "falta env" debe ir antes — Vitest aísla módulos por archivo con `vi.resetModules()`. Si falla por cache, añadir `import { vi } from "vitest"` y `vi.resetModules()` en un `beforeEach`.

- [ ] **Step 6: Correr y verificar que pasa**

Run: `pnpm test src/lib/__tests__/supabase`
Expected: PASS (ajustar con `vi.resetModules()` si el cache molesta).

- [ ] **Step 7: Verificar build**

Run: `pnpm build`
Expected: "Compiled successfully".

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: cliente Supabase + envs"
```

---

## Task 10: Configuración PWA (manifest + iconos + instalable)

**Files:**
- Create: `app-web/public/manifest.webmanifest`
- Create: `app-web/public/icons/icon-192.png` y `icon-512.png` (placeholders)
- Modify: `app-web/src/app/layout.tsx` (link al manifest)
- Create: `app-web/public/sw.js`
- Create: `app-web/src/components/ServiceWorkerRegister.tsx`

> Estrategia: PWA mínima manual (manifest + service worker básico) sin depender de un plugin que pueda chocar con el adapter de Cloudflare. Caching avanzado → más adelante.

- [ ] **Step 1: Crear el manifest**

Create `public/manifest.webmanifest`:
```json
{
  "name": "Trivia",
  "short_name": "Trivia",
  "description": "Trivia diaria con tu grupo",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0e1a",
  "theme_color": "#0a0e1a",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Step 2: Generar iconos placeholder**

Run (en `app-web/`):
```bash
mkdir -p public/icons
pnpm dlx sharp-cli --version >/dev/null 2>&1 || true
```
Si no hay herramienta de imágenes a mano, crear los PNG manualmente (cualquier cuadrado violeta 192x192 y 512x512) o exportar desde Figma/Canva con la mascota. Verificación: ambos archivos existen.
Run: `ls public/icons`
Expected: `icon-192.png  icon-512.png`.

- [ ] **Step 3: Service worker básico**

Create `public/sw.js`:
```js
// Service worker mínimo: habilita instalación PWA. Sin estrategia de cache por ahora.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // Passthrough; el caching offline llega en un plan posterior.
});
```

- [ ] **Step 4: Registrar el SW desde el cliente**

Create `src/components/ServiceWorkerRegister.tsx`:
```tsx
"use client";
import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registro best-effort */
      });
    }
  }, []);
  return null;
}
```

- [ ] **Step 5: Enlazar manifest + SW en el layout**

En `src/app/layout.tsx`, añadir al `metadata`:
```tsx
export const metadata: Metadata = {
  title: "Trivia",
  description: "Trivia diaria con tu grupo",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Trivia" },
};
```
Y dentro de `<body>`, antes de `<AppShell>`, importar y montar:
```tsx
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
// ...
<body>
  <ServiceWorkerRegister />
  <AppShell>{children}</AppShell>
</body>
```

- [ ] **Step 6: Verificar instalabilidad**

Run: `pnpm build && pnpm start`
Abrir http://localhost:3000 en Chrome → DevTools → Application → Manifest.
Expected: manifest detectado sin errores, iconos cargan, "Installable" en verde (o el botón de instalar disponible).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: PWA instalable (manifest + service worker)"
```

---

## Task 11: Deploy en Cloudflare vía @opennextjs/cloudflare

**Files:**
- Create: `app-web/wrangler.jsonc`
- Create: `app-web/open-next.config.ts`
- Modify: `app-web/package.json` (scripts de deploy)
- Modify: `app-web/.gitignore` (ignorar `.open-next/`)

- [ ] **Step 1: Instalar el adapter**

Run (en `app-web/`):
```bash
pnpm add @opennextjs/cloudflare
pnpm add -D wrangler
```

- [ ] **Step 2: Config de OpenNext**

Create `open-next.config.ts`:
```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

export default defineCloudflareConfig();
```

- [ ] **Step 3: Config de Wrangler**

Create `wrangler.jsonc`:
```jsonc
{
  "name": "trivia",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-03-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  }
}
```

- [ ] **Step 4: Scripts de build/deploy**

En `package.json`, dentro de `"scripts"`, añadir:
```json
"cf:build": "opennextjs-cloudflare build",
"cf:preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
"cf:deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
```

- [ ] **Step 5: Ignorar artefactos de build**

Añadir a `app-web/.gitignore` (crear el archivo si no existe; Next ya pone uno):
```
.open-next/
.wrangler/
```

- [ ] **Step 6: Preview local del worker**

Run:
```bash
pnpm cf:preview
```
Expected: build de OpenNext completa, worker levanta en una URL local (http://localhost:8787 o similar); la app se ve igual que en `pnpm dev`.

- [ ] **Step 7: Cargar envs en Cloudflare**

Run (en `app-web/`):
```bash
pnpm dlx wrangler secret put NEXT_PUBLIC_SUPABASE_URL
pnpm dlx wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Pegar cada valor cuando lo pida.

> Nota: las `NEXT_PUBLIC_*` se inlinean en build. Para que el build de Cloudflare las tenga, además definirlas como variables de entorno del proyecto en el dashboard de Cloudflare (Workers & Pages → tu proyecto → Settings → Variables) o exportarlas antes de `cf:build`. Para el primer deploy manual desde tu máquina, basta con que estén en `.env.local`.

- [ ] **Step 8: Deploy real**

Run:
```bash
pnpm cf:deploy
```
Expected: deploy exitoso, Wrangler imprime la URL pública `https://trivia.<tu-subdominio>.workers.dev`.

- [ ] **Step 9: Verificación en celular**

Abrir la URL pública en el celular → debería verse la home con identidad visual. En Chrome/Safari móvil: menú → "Agregar a pantalla de inicio". Abrir desde el ícono.
Expected: la app abre en pantalla completa (sin barra del navegador), modo standalone.

- [ ] **Step 10: Commit final**

```bash
cd "C:/Users/franc/OneDrive/Importantes/04 Proyectos/Trivia"
git add -A
git commit -m "feat: deploy en Cloudflare vía @opennextjs/cloudflare"
```

---

## Verificación final del Plan 1

- [ ] `pnpm test` → todos los tests pasan.
- [ ] `pnpm build` → compila sin errores.
- [ ] `pnpm cf:preview` → worker local levanta y la app se ve correcta.
- [ ] URL pública de Cloudflare abre la home con identidad visual.
- [ ] La PWA se instala en el celular y abre en modo standalone.

**Entregable:** PWA desplegada, instalable, con el sistema de diseño "editorial vivo", lista para construir encima el pipeline de contenido (Plan 2) y el loop de juego (Plan 3).

---

## Self-review (cobertura vs. spec, sección 5 y 6)

- **Visual "editorial vivo"** (spec §5): fondo con gradientes ✓ (Task 4), mascota búho con expresiones ✓ (Task 6), iconos+color por categoría ✓ (Task 5), componentes base ✓ (Task 7), home showcase ✓ (Task 8). Animaciones Framer Motion: **no en este plan** — se aplican en el Plan 3 (loop de juego) donde hay acierto/error que animar. Framer Motion se instala cuando se use, no antes (YAGNI).
- **Mobile-first 360–420px** (spec §5): AppShell con `max-w-[420px]` ✓ (Task 4).
- **Stack** (spec §6): Next.js+TS ✓ (Task 1), Tailwind ✓ (Task 3), Supabase cliente ✓ (Task 9), PWA ✓ (Task 10), Cloudflare via `@opennextjs/cloudflare` ✓ (Task 11). Realtime/Auth/tablas: fuera de alcance de este plan (Planes 2/4/6), correcto.
- **Modelo de datos** (spec §7): no se crean tablas en este plan; el cliente queda listo. Coherente con la descomposición.
- Sin placeholders de tipo "TODO/implementar luego" en pasos de código. Los iconos PNG son el único artefacto manual (imágenes), con verificación explícita de existencia.
