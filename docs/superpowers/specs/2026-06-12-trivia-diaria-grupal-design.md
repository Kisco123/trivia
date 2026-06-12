# Trivia Diaria Grupal — Diseño (Spec V1)

**Fecha:** 2026-06-12
**Autor:** Francisco (con Claude)
**Estado:** Diseño aprobado, pendiente plan de implementación

---

## 1. Visión

Aplicación web (PWA) mobile-first de trivia diaria con ranking grupal. Cada día
aparece un set de **3 preguntas** (fácil, media, difícil). Los usuarios juegan
dentro de grupos privados (amigos, familia, trabajo) y compiten por el ranking
del día, de la semana y de la temporada. Inspirada en el formato de **Playus**
(juego diario + ranking acumulado + chat grupal), pero con trivia de cultura
general en lugar de minijuegos de habilidad.

**Por qué trivia y no minijuegos:** el principal pain point de Playus es que
los ~30 minijuegos se vuelven repetitivos tras 2-3 temporadas. La trivia tiene
la ventaja estructural inversa: cada pregunta es contenido fresco si hay un
banco grande. Además se siente *útil* (aprendizaje), lo que da permiso social
para jugarlo en familia, no solo entre amigos jóvenes.

**Origen:** proyecto personal / hobby para jugar con el círculo cercano del
autor (Chile), con potencial de crecer y eventualmente monetizar.

### Criterios de éxito (primeras 4 semanas)
- Métrica norte: **retención D7 dentro de un grupo activo**. Si el grupo inicial
  de amigos juega 7 días seguidos, el formato prendió.
- No se mide por descargas sino por uso diario sostenido del grupo semilla.

---

## 2. Mecánica del producto (loop core)

### Sesión diaria
- **3 preguntas/día** con dificultad progresiva:
  - Pregunta 1: **fácil**
  - Pregunta 2: **media**
  - Pregunta 3: **difícil**
- Mix de formatos: alternativas (opción múltiple) y, a futuro, respuesta abierta.
  V1 arranca con **opción múltiple** (4 alternativas) por simplicidad y por ser
  el formato de las APIs fuente.
- **1 sola oportunidad por pregunta** (sin reintentos). Esto genera tensión y
  es parte del anti-cheat.
- Timer por pregunta. La velocidad de respuesta otorga puntos extra.

### Scoring ponderado
La dificultad debe valer la pena para que la pregunta difícil decida el día:

| Pregunta | Dificultad | Base (acierto) | Bonus velocidad (máx) |
|----------|-----------|----------------|------------------------|
| 1        | Fácil     | 100            | +30                    |
| 2        | Media     | 200            | +60                    |
| 3        | Difícil   | 400            | +100                   |

El bonus de velocidad decrece linealmente con el tiempo transcurrido. Quien
clava la difícil se diferencia; quien la falla aún defiende posición con
velocidad en las anteriores. Genera drama y conversación grupal.

### Acumulación y temporadas (modelo Playus)
- Los puntos **acumulan a lo largo de la temporada** (no se resetean semanal).
- **Temporada** = ~28 días (4 semanas). Al final, un jugador se corona campeón
  y arranca temporada nueva fresca.
- Rankings visibles en tres vistas: **Hoy / Semana / Temporada**.
- Ranking diario muestra quién ganó el día (1°, 2°, 3°, 4°...).

### Streaks
- Cada jugador tiene una **racha personal** de días consecutivos jugados.
- Se muestra en el topbar y junto a su nombre en el ranking.
- Romper la racha resetea a 0. (Recompensas por streak → backlog.)

### Grupos
- **Grupos privados** con invitación por link/código.
- **Multi-grupo**: un usuario puede estar en varios grupos a la vez.
- **Score único por usuario por día**: el usuario juega las 3 preguntas **una
  sola vez**, y ese score se **replica en todos sus grupos**. No puede rejugar
  para mejorar en otro grupo.
  - Resuelve el problema de "ya vi la respuesta en otro grupo".
  - Anti-cheat estructural (una sola sesión por día).
  - Modelo de datos simple (un score por usuario por día).

### Chat grupal
- Chat dentro del grupo, accesible tras jugar.
- V1: mensajes de texto + **reacciones con emoji**.
- GIFs → backlog.

### Power-ups (estilo "Quién quiere ser millonario")
- **50/50** (✂️): elimina 2 alternativas incorrectas.
- **Pista** (💡): da una ayuda contextual.
- **Tiempo extra** (⏱️): añade segundos al timer.
- Cantidad limitada gratis por día. Monetización de power-ups extra → backlog.
- **Nota de diseño:** el modelo de Playus de "ver un anuncio para reintentar"
  NO aplica a trivia (al fallar ya se revela la respuesta). Por eso la
  monetización se mueve a power-ups *antes* de responder, cosméticos y premium.

---

## 3. Autenticación (mínima fricción)

- **Acceso anónimo instantáneo**: el usuario entra y juega las 3 preguntas del
  día de inmediato, sin login. Ve su score.
- **Login con Google (OAuth)** requerido solo al **crear o unirse a un grupo**
  ("para unirte al grupo necesitamos saber quién sos").
- El progreso/historial anónimo se **vincula a la cuenta** al loguearse.
- Apple Sign-In y otros métodos → backlog (V1.5 si aparece demanda iOS).

---

## 4. Pipeline de contenido

El cuello de botella real del producto es el contenido (~3 preguntas/día × 365
= ~1100 preguntas/año, balanceadas y sin ambigüedades).

### Fuente V1: APIs públicas de trivia
- **Open Trivia Database** (opentdb.com) — gratis, ~4000 preguntas con
  alternativas, licencia CC BY-SA (requiere atribución).
- **The Trivia API** (the-trivia-api.com) — gratis, mejor categorizada.

### Procesamiento (pipeline asistido por LLM)
Flujo: descargar lotes grandes → guardar raw en BD → procesar cada pregunta con
Claude → revisión humana por lotes → aprobar.

El prompt de procesamiento Claude debe:
1. **Traducir a español neutro** (sin chilenismos para no excluir, sin
   argentinismos).
2. **Filtrar por audiencia (círculo chileno del autor)**: descartar
   - Deportes muy estadounidenses (NFL, MLB, NBA salvo estrellas globales).
   - Trivia escolar gringa, pop culture US no exportada.
   - Dialectos/nombres propios oscuros y muy específicos.
   - Objetivo: preguntas **generales, relativamente fáciles** que una persona
     del círculo del autor podría saber, en todas las categorías.
3. **Re-etiquetar dificultad** relativa al público objetivo (lo que un
   estadounidense considera "easy" puede ser difícil acá y viceversa).
4. **Validar respuesta inequívoca**.
5. **Banear preguntas con respuesta cambiante en el tiempo** ("¿quién es
   presidente de X?").

El autor da **aprobación final por lotes** (~30 min/mes).

### Estructura i18n-ready desde día 1
- Cada pregunta vive en BD con campos por idioma (`es`, `en`).
- V1 se **lanza solo en español**, pero la arquitectura soporta inglés sin
  rewrite.

### Categorías (V1, sujeto a lo que las APIs ofrezcan tras filtro)
Historia, Ciencia, Geografía, Arte/Literatura, Cine/TV, Música, Deporte
(global), Cultura general. Cada categoría tiene su ícono y color.

---

## 5. Identidad visual

**Dirección elegida:** "Editorial vivo" — base sobria/oscura tipo NYT Games,
pero con vida (color, profundidad, personaje, animaciones). NO plano.

### Elementos
- **Paleta**: fondo oscuro (#0a0e1a) con gradientes muy suaves violeta (#7c5cff)
  y naranja (#ff8a4c), patrón de puntos sutil para profundidad.
- **Mascota**: un búho (placeholder 🦉, en producción ilustración custom con
  5-6 expresiones: neutral, sorprendido, alegre, triste, victorioso, dudoso).
  Aparece con burbuja de diálogo y "comenta" las preguntas/resultados. Es el
  alma de la marca. **Debe ubicarse sin superponerse al texto** (arriba de la
  pregunta, no encima).
- **Iconos por categoría**: cada categoría con ícono y color propio.
- **Indicadores con personalidad**: racha con gradiente naranja-magenta y glow;
  progreso del día con 3 dots animados.
- **Animaciones** (Framer Motion):
  - Acierto: confeti del color de la categoría + mascota sonríe + glow verde.
  - Error: shake suave + mascota triste + brillo rojo discreto.
- **Mobile-first absoluto**: viewport objetivo 360px. Todo debe verse perfecto
  en celular (es el dispositivo primario de uso).

### Pantallas centrales
1. **Pregunta diaria**: topbar (grupo + streak), progreso 3 dots, mascota con
   burbuja, categoría, card de pregunta, 4 alternativas, power-ups, timer
   circular.
2. **Ranking**: tabs (Hoy / Semana / Temporada), podio top-3 con corona dorada
   al #1, lista con fila propia resaltada y streak por jugador.

Mockups de referencia guardados en `.superpowers/brainstorm/`.

---

## 6. Stack técnico

| Capa            | Tecnología                                          |
|-----------------|------------------------------------------------------|
| Frontend        | Next.js 14 (App Router) + React + TypeScript        |
| Estilos         | Tailwind CSS                                         |
| Animaciones     | Framer Motion                                       |
| PWA             | next-pwa (instalable, full-screen, push)            |
| Backend (BaaS)  | Supabase: Postgres + Auth + Realtime + Storage      |
| Pipeline LLM    | Supabase Edge Functions → API de Claude             |
| Deploy          | **Cloudflare Pages** vía `@opennextjs/cloudflare`   |

**Justificación:**
- Supabase Realtime resuelve chat grupal y rankings en vivo sin websocket
  server propio.
- Supabase es un servicio aparte: no depende de dónde se hostea el frontend, así
  que Cloudflare + Supabase juegan bien juntos.
- Next.js en Cloudflare requiere el adapter `@opennextjs/cloudflare` (maduro,
  sucesor de next-on-pages). Agrega una capa de config pero permite mantener el
  ecosistema React.
- Free tiers (Supabase + Cloudflare) sobran para el grupo semilla y bastante
  más allá.

---

## 7. Modelo de datos (alto nivel)

Entidades principales (a detallar en el plan de implementación):

- **users** — id, auth provider, display_name, avatar, created_at. Soporta
  usuarios anónimos vinculables.
- **questions** — id, category, difficulty, texto (es/en), alternativas,
  respuesta correcta, fuente, estado de aprobación (raw/approved/rejected).
- **daily_sets** — fecha, pregunta_facil_id, pregunta_media_id,
  pregunta_dificil_id. Un set por día, global (mismo para todos).
- **groups** — id, nombre, invite_code, owner_id, season_actual, created_at.
- **group_members** — group_id, user_id, joined_at.
- **plays** — user_id, daily_set_id, fecha, score_total, detalle por pregunta
  (acierto, tiempo, power-ups usados). **Único por user+día** (replica a todos
  sus grupos).
- **streaks** — user_id, racha_actual, ultima_fecha_jugada.
- **chat_messages** — group_id, user_id, texto, reacciones, created_at.

**Anti-cheat:** timer server-side, una sola `play` por user+día, sin retomar
sesión.

---

## 8. Scope V1 (MVP) — qué entra

- Jugar las 3 preguntas del día (fácil/media/difícil) con timer y scoring
  ponderado.
- Acceso anónimo instantáneo; login Google al unirse/crear grupo.
- Crear grupo + unirse por link/código.
- Multi-grupo con score único del día replicado.
- Rankings Hoy / Semana / Temporada con podio y corona.
- Streaks personales.
- Chat grupal con texto + reacciones emoji.
- Power-ups: 50/50, pista, tiempo extra (cantidad limitada gratis/día).
- Pipeline de contenido: APIs públicas → procesado LLM (traducción + filtros
  chilenos + dificultad) → BD, en español.
- PWA instalable, mobile-first, identidad "editorial vivo" con mascota búho.

---

## 9. Roadmap post-MVP (backlog para el pitch)

Funcionalidades acordadas como deseables pero **fuera de V1**:

1. **Importar banco de 6000+ preguntas del juego físico** del autor (foto de
   tarjetas + OCR + revisión LLM). Cada tarjeta tiene 6 preguntas, +1000
   tarjetas. Es el *moat* de contenido con sabor único. (Bloqueado hoy: el
   juego no está accesible físicamente.)
2. **Activar inglés** (la arquitectura ya queda i18n-ready).
3. **Preguntas propuestas por la comunidad** con sistema de voting.
4. **Ranking global público** (cuando haya masa crítica de usuarios).
5. **Premios reales** al campeón de temporada.
6. **Categorías premium** pagadas (cine clásico, deporte, música, etc.).
7. **Power-ups extra comprables**.
8. **Streaks recompensadas** (insignias, cosméticos).
9. **Cosméticos de grupo** (skin, marco de avatar, animaciones de victoria).
10. **Premium sin ads**.
11. **Estadísticas detalladas** por usuario y categoría (% aciertos, evolución).
12. **Modo desafío 1v1** entre dos amigos fuera del grupo.
13. **Notificaciones push** ("ya está disponible el desafío de hoy" / "quedan
    2h").
14. **Respuesta abierta** (no solo opción múltiple), aprovechando el banco
    físico.
15. **GIFs en el chat**.
16. **Apple Sign-In** y otros métodos de login.

---

## 10. Decisiones registradas (resumen)

- 3 preguntas/día, dificultad progresiva, scoring ponderado.
- Puntos acumulan en temporada de ~28 días; corona al campeón.
- Rankings Hoy/Semana/Temporada + streaks.
- Grupos privados, multi-grupo, score único replicado.
- Auth anónima → Google al unirse a grupo.
- Contenido vía APIs públicas + procesado LLM con filtros para público chileno.
- Lanzamiento solo en español, arquitectura i18n-ready.
- Visual "editorial vivo" + mascota búho, mobile-first.
- Stack: Next.js + Supabase + Cloudflare Pages.
- Monetización (power-ups/cosméticos/premium) → diseño posterior.
