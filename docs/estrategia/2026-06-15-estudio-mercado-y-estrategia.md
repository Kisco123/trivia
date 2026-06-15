# Trivia — Estudio de Mercado, Modelo de Negocio y Plan de Crecimiento

**Fecha:** 2026-06-15
**Producto:** Trivia — PWA de trivia diaria con ranking grupal y chat (estilo "Wordle social" / Playus de trivia).
**URL en producción:** https://trivia.franciscohubner12.workers.dev/
**Autor del análisis:** Claude (investigación con datos web reales — fuentes al final).

---

## 0. Resumen ejecutivo (TL;DR)

- **El mercado existe y crece.** Los juegos de trivia mueven ~**US$3.000 millones** al año y crecen ~**8-9% anual**; el mercado de juegos móviles en LATAM crece ~**9,7% anual** y Chile tiene **ARPU alto** para la región. No es un nicho muerto.
- **El formato está validado.** "Un juego al día + racha + compartir resultado" es exactamente lo que hizo a **Wordle** un fenómeno (y motivó su compra por el NYT). **Trivia Crack/Preguntados** (de etermax, argentina) probó que la trivia social escala en LATAM: **+600M descargas, +150M usuarios activos/año**.
- **Tu ventaja vs. los que fracasaron.** **HQ Trivia** llegó a 2,3M de jugadores simultáneos y quebró: dependía de premios en efectivo, eventos en vivo carísimos y contenido repetitivo. Tu modelo (asíncrono, grupal, sin premios en efectivo, contenido fresco diario) **no tiene esos costos ni esos riesgos**.
- **El riesgo #1 no es la competencia: es la retención.** La pregunta que vale es si la gente vuelve sola cada día. Por eso **lo correcto ahora NO es monetizar ni hacer marketing pagado**, sino **validar con un piloto** (tu familia/amigos) y medir retención D7.
- **Monetización: realista pero más adelante.** El 97% de los ingresos de juegos móviles es free-to-play; solo ~**3,5%** de los jugadores pagan. Para Trivia, el camino es **híbrido suave**: anuncios recompensados (power-ups) + un "Premium sin ads / cosméticos" + categorías premium. **Nada de esto antes de tener retención.**
- **Crecimiento: el motor es viral, no pagado.** El "comparte tu resultado" (estilo Wordle) y la invitación por grupo dan un **loop viral (K-factor)** gratis. Instagram (Reels) es el complemento orgánico.

---

## 1. El producto hoy

Trivia es una **PWA mobile-first** ya desplegada y funcional con:
- **Desafío diario:** 3 preguntas (fácil/media/difícil) que rotan automáticamente cada día.
- **Anti-trampa:** timer de 12 s + bloqueo si cambias de pestaña (evita googlear).
- **Grupos privados:** crear/unirse por link, multi-grupo, ranking (hoy/semana/temporada), chat en tiempo real con reacciones.
- **Perfil con estadísticas** (puntos, racha actual/máxima, promedio), **dato curioso del día**, e **instalación a pantalla de inicio**.
- Banco de preguntas curado en español neutro, filtrado para público chileno; ~108 preguntas listas (≈36 días de contenido).

**Diferenciador central:** no es trivia contra desconocidos (como Preguntados), sino **trivia diaria dentro de tu círculo cercano** (familia, amigos, trabajo), con la rivalidad y conversación que eso genera. Es el cruce de **Wordle (hábito diario)** + **grupo de WhatsApp (capa social)**.

---

## 2. Tamaño de mercado y oportunidad

| Mercado | Tamaño | Crecimiento |
|---|---|---|
| Juegos de trivia (global) | US$2,98-3,4 mil M (2024) → US$6,3-7,5 mil M (2033) | CAGR ~8,6-9,2% |
| Juegos móviles (global) | US$121 mil M (2025) → US$289 mil M (2034) | CAGR ~9,7% |
| Juegos móviles LATAM | US$3,2 mil M (2025) → US$7,3 mil M (2034) | CAGR ~9,7% |
| Juegos móviles/handheld Chile | US$565,7 M (2024) | CAGR ~8,5% |

**Lectura:** es un mercado grande, en crecimiento sostenido, con LATAM acelerando por la penetración de smartphones y datos baratos. **Chile y Colombia destacan por ARPU alto** (los usuarios que pagan, pagan más que el promedio regional). El segmento móvil domina por sobre PC/consola por accesibilidad y costo.

---

## 3. Audiencia objetivo

**Núcleo (beachhead) — por dónde empezar:**
- **Grupos cerrados hispanohablantes (Chile primero):** familias, grupos de amigos, compañeros de trabajo/universidad. Edad amplia (18-55), porque la trivia "se siente útil" (aprendizaje) y es apta para todas las edades — ventaja sobre juegos de habilidad que sesgan a jóvenes.
- **Perfil del usuario gatillo:** la persona del grupo que organiza, comparte cosas en el chat familiar, le gusta competir amistosamente ("el cerebrito" o "el competitivo"). Esa persona instala, crea el grupo e invita al resto. Es tu **vector de adquisición**.

**Expansión (en orden):**
1. Círculos cercanos en Chile (validación).
2. LATAM hispanohablante (mismo idioma, mismo formato cultural; Preguntados ya probó que funciona).
3. Inglés / global (la arquitectura ya quedó i18n-ready).

**Por qué este orden:** la app **no sirve con un solo usuario** — necesita grupo. Por eso la unidad de adquisición no es "un usuario" sino "un grupo". Crecer por grupos cerrados da retención alta desde el día 1 (presión social) y un loop viral natural.

---

## 4. ¿Ya existe? Análisis competitivo

| Competidor | Qué es | Qué aprender |
|---|---|---|
| **Preguntados / Trivia Crack** (etermax, Argentina) | Trivia 1v1 contra amigos/desconocidos, por turnos. +600M descargas, +150M activos/año, #1 en 125 países. | Prueba que la trivia social **escala en LATAM**. Pero su loop es 1v1 por turnos, no "diario grupal". Hoy es un producto **maduro y en declive** (ingresos mensuales modestos: ~US$110k combinados). Hueco: **el formato diario + grupo cerrado** que ellos no ocupan. |
| **Wordle / NYT Games** | Un puzzle al día, reset a medianoche, racha, compartir grilla. | El **manual del formato diario**: 1 intento/día crea anticipación y hábito; la racha y el "compartir resultado" generan viralidad y dopamina. Lo copiamos en trivia. Comprado por el NYT → validación de que el formato vale oro. |
| **Playus** (Dapps, Singapur) | Minijuegos diarios + ranking grupal + chat. La inspiración directa. | Valida el formato "diario + grupo + chat". Su debilidad: **~30 minijuegos que se repiten y aburren tras 2-3 temporadas**. Nuestra ventaja estructural: **cada pregunta es contenido nuevo** si el banco es grande. |
| **HQ Trivia** (cerró 2020) | Trivia en vivo, premios en efectivo, host. Pico 2,3M simultáneos → quiebra. | **Caso de estudio de qué NO hacer** (sección 8). Dependía de eventos en vivo costosos, premios en efectivo y novedad. Sin foso defensivo. |
| **QuizUp** | Trivia por temas contra desconocidos. Creció rápido y se apagó. | La trivia contra desconocidos retiene mal sin capa social fuerte. Refuerza apostar por el **círculo cerrado**. |

**Conclusión:** el formato está probado por separado (Wordle = diario; Preguntados = trivia social LATAM; Playus = diario+grupo). **Nadie domina el cruce exacto "trivia diaria + grupo cerrado + chat" en español.** Ahí está el hueco.

---

## 5. Por qué el formato diario + grupal funciona (la tesis)

Datos de retención (benchmarks 2025-2026):
- Juego casual promedio: **D1 ~30%, D7 10-20%, D30 ~4-6%**.
- Juegos de "match"/puzzle (los más pegajosos): **D1 32,6%, D30 7,1%**.
- iOS retiene más que Android.

**Las 4 palancas que explotamos (todas presentes o en backlog):**
1. **Escasez diaria:** 1 desafío al día → anticipación, no saturación (lección Wordle).
2. **Racha (streak):** la racha y "mejor racha" empujan a no romper la cadena (efecto Duolingo). Ya implementado; el **escudo de racha** está en backlog.
3. **Presión social del grupo:** "no quiero quedar último hoy" retiene mejor que cualquier notificación. Es el corazón del producto.
4. **Loop viral:** compartir el resultado (estilo grilla de Wordle) + invitación por grupo = **K-factor**. Si cada usuario trae ≥1 usuario, el crecimiento se sostiene solo.

---

## 6. Modelo de negocio y monetización

**Realidad cruda de los datos:**
- **97%** de los ingresos de juegos móviles viene de **free-to-play**.
- **77%** de los ingresos son **compras in-app (IAP)**; los **anuncios recompensados** son el formato estrella (**45%** de los ingresos por ads en casual).
- Solo **~3,5%** de los jugadores pagan alguna vez (pero generan la mayoría de los ingresos).
- **82%** prefiere juegos gratis con ads, pero **46,8%** dice que los ads son su mayor frustración → los ads tienen que ser **opcionales y con recompensa**, nunca intrusivos.
- Las **suscripciones** crecen (13% YoY, US$4,2 mil M en 2025). Un tutorial que explique la moneda del juego sube la conversión a pagador **+21%**.

**Recomendación para Trivia (en orden, y SOLO tras validar retención):**

1. **Gratis con todo lo core** (jugar, grupos, ranking, chat). Nunca cobrar por jugar la diaria.
2. **Anuncios recompensados → power-ups.** El usuario ve un ad **voluntariamente** para ganar un 50/50 o una pista. Es el formato menos molesto y el más rentable en casual. (Ya dejamos los power-ups como "ganables/por anuncio" en el diseño.)
3. **"Trivia Premium" (suscripción baja, ~US$1-2/mes o equivalente CLP):** sin ads, power-ups mensuales, estadísticas avanzadas, temas visuales. Conversión esperada baja (1-5%) pero margen alto.
4. **Categorías premium / packs temáticos** (cine, deporte, música, "trivia chilena"): IAP de una vez. Contenido pago sin tocar el loop gratuito.
5. **Cosméticos** (títulos, marcos, temas): economía estética con la "moneda" que ganas jugando. Monetiza a los súper-fans sin pay-to-win.

**Regla de oro:** **monetización ≠ ahora.** Primero retención. Monetizar una app sin usuarios retenidos no genera ingresos, solo fricción que mata el crecimiento.

**Potencial de ingresos (orden de magnitud, ilustrativo):** con ARPU casual típico de ~US$0,05-0,20/usuario activo/mes vía ads + ~3% pagando ~US$1-2/mes, un producto con 10.000 usuarios activos podría generar del orden de **US$500-2.000/mes**. Es un negocio de **volumen**: la palanca es crecer usuarios, no exprimir a pocos.

---

## 7. Escalabilidad

**Técnica:** muy alta. PWA en Cloudflare (edge global, escala automática) + Supabase (Postgres gestionado). Costo marginal por usuario ~cero en tiers gratuitos hasta miles de usuarios. Sin tiendas de apps (sin comisión 30%, sin proceso de aprobación). **Deploy continuo** (push → producción).

**De contenido (el verdadero límite):** el cuello de botella es el **banco de preguntas**. Mitigación:
- Pipeline LLM (traducir/filtrar bancos públicos) — ya diseñado.
- **Tus +6.000 preguntas del juego físico** (foto + OCR) — el **moat de contenido** y el activo más valioso para el pitch.
- Preguntas propuestas por la comunidad (V2).

**De idioma:** arquitectura i18n-ready → abrir a inglés/otros mercados es activar, no reconstruir.

**Límite real de escalado:** la **moderación** (chat, contenido de comunidad) y la **calidad de preguntas** a gran volumen. Resoluble con curaduría + LLM, pero a vigilar.

---

## 8. Riesgos y lecciones (el cementerio: HQ Trivia y otros)

| Riesgo | Lección | Cómo lo evitamos |
|---|---|---|
| **Quemar plata en premios/eventos** | HQ Trivia dependía de premios en efectivo y shows en vivo costosísimos. | Sin premios en efectivo. Recompensas = estatus social (corona, racha), no dinero. Costo casi cero. |
| **Contenido repetitivo** | HQ y Playus aburrieron por repetición. | Banco grande + diario + pipeline de contenido. La trivia es contenido infinito si lo alimentas. |
| **Novedad sin foso** | HQ era una moda; no tenía razón para que volvieras una vez pasada la novedad. | El **grupo cerrado** es el foso: tus amigos están ahí, tu racha está ahí. Eso retiene más que cualquier feature. |
| **Saltar a monetizar/escalar antes de tiempo** | Distracción (HQ lanzó 5 sub-apps en vez de pulir la principal). | Foco brutal: validar el loop con la familia antes de cualquier cosa. |
| **Trampa (googlear)** | Mata la gracia de la competencia. | Ya mitigado: timer 12s + bloqueo por cambio de pestaña. (Timing server-side robusto en backlog.) |
| **Dependencia de un solo canal** | — | Loop viral (grupo + compartir) + Instagram orgánico, no un solo canal pagado. |

---

## 9. Qué más se le puede agregar (sintetizado del backlog + creativo)

Priorizado por **impacto en retención / esfuerzo**, a construir **según lo que revele el piloto**:

**Alto impacto, ya recomendado:**
- 🛡️ **Escudo de racha** (proteger la racha si faltas un día) — palanca de retención top.
- 👑 **Coronar ganador semanal + muro de trofeos** del grupo — clímax competitivo + memoria.
- 🔔 **Notificaciones diarias** ("ya está el desafío") — recordatorio = hábito. Gratis vía Web Push + Cron Cloudflare.
- 📊 Perfil con **% por categoría / "tu fuerte"** — autoconocimiento engancha.

**Engagement social (fase 2):**
- 🎲 **Apuestas/predicciones del grupo** (con puntos del juego): apostar a que el "cerebrito" saca perfecto; retos 1v1; "la bolsa" del día. Genera muchísima conversación en el chat. (Idea de Gemini, muy buena.)
- 🗳️ **"Pregunta del grupo":** un miembro propone una pregunta para su grupo. Comunidad a escala chica.
- 👥 **Perfiles de amigos / comparar** stats.

**Contenido y exploración:**
- 📚 **Archivo histórico** (jugar días pasados, modo práctica).
- ♾️ **Modo práctica infinito** (requiere banco grande → tarjetas físicas).
- 🎁 **Recap de fin de temporada** compartible.

**Monetización/economía (solo con retención):**
- 🛒 Tienda de cosméticos (títulos, temas visuales, marcos) con moneda ganada jugando.
- 🌎 Inglés, ranking global, categorías premium.

**Regla:** ninguna de estas antes de validar que la gente vuelve. Son multiplicadores de un loop que primero hay que probar que existe.

---

## 10. Plan de prueba piloto (paso a paso)

Metodología estándar de validación (alpha → beta → métricas):

### Fase A — Alpha (esta semana, 5-10 personas)
1. **Grupo semilla:** tu familia y/o 1 grupo de amigos. Mándales el link, que **instalen la app** (pantalla de inicio) y se unan a UN grupo.
2. **Objetivo:** que jueguen **7 días seguidos**. Tú recuerdas por WhatsApp los primeros días (aún no hay push).
3. **Qué observar (cualitativo):** ¿vuelven sin que les recuerdes al día 3-4? ¿comentan en el chat? ¿se pica el ranking? ¿alguna pregunta generó duda/queja? ¿la instalación fue fácil?
4. **Recoge feedback simple:** un mensaje al día 7 preguntando "del 1 al 10, ¿qué tan probable es que se lo recomiendes a un amigo?" (NPS casero) y "¿qué le falta / qué le sacarías?".

### Fase B — Beta (semanas 2-4, 20-40 personas, grupos NUEVOS)
5. Pide a tu grupo alpha que **cada uno cree su propio grupo** e invite a SU gente (familia, pololo/a, trabajo). Mide si el **loop viral** funciona: ¿se crean grupos sin que tú empujes?
6. Aplica los ajustes que pidió la alpha. Activa **notificaciones** si la retención lo pide.
7. **Métricas a mirar** (cuando conectemos analítica simple): usuarios activos diarios (DAU), **retención D1/D7** por grupo, % que completa el desafío, nº de grupos creados por usuario invitado (proxy de K-factor).

### Criterios de éxito (semáforo)
- 🟢 **Sigue:** retención D7 dentro de un grupo activo **> 25-30%**, grupos que juegan 5+ días seguidos, gente creando grupos sola. → Invertir en crecimiento (Instagram) y luego monetización.
- 🟡 **Ajusta:** retención D7 10-25%. Hay algo, falta pulir (¿contenido? ¿recordatorios? ¿onboarding?). Iterar y re-testear.
- 🔴 **Repensar:** D7 < 10% y nadie vuelve solo. El formato no prendió con este público; entrevistar y pivotear antes de gastar en marketing.

---

## 11. Camino a seguir (roadmap) y expectativas

**Mes 1 — Validar (gratis, sin marketing):**
- Correr alpha + beta con el círculo cercano.
- Construir solo lo que el piloto pida (probablemente: notificaciones, escudo de racha, coronar ganador).
- Meta: tener **1-3 grupos que jueguen 2 semanas seguidas** y datos de retención.

**Mes 2 — Pulir + preparar crecimiento:**
- Cerrar fugas que reveló el piloto (onboarding, contenido, bugs).
- Ampliar banco de preguntas (idealmente empezar a digitalizar tus tarjetas físicas).
- Armar la presencia en Instagram (ver kit aparte) y publicar de forma orgánica.

**Mes 3 — Crecer orgánico:**
- Instagram (3-5 Reels/semana), apoyándote en el loop viral (compartir resultado + invitar grupo).
- Medir K-factor y CAC orgánico (debería ser ~0).
- Si la retención aguanta el crecimiento → introducir monetización suave (ads recompensados + premium).

**Expectativas realistas (honestidad):**
- Esto es un **hobby con potencial**, no un cohete garantizado. La mayoría de los juegos casuales no retienen; por eso validamos barato antes de invertir.
- El éxito temprano se mide en **retención y grupos activos**, no en descargas ni dinero.
- La monetización seria llega **solo con volumen** (miles de activos). Antes, el objetivo es **producto que la gente ama y comparte**.
- Tu activo diferencial para un eventual pitch: **las +6.000 preguntas físicas** (moat de contenido) + **datos reales de retención** del piloto. Eso es lo que hace creíble la historia.

---

## 12. KPIs a seguir (tablero mental)

| Métrica | Qué mide | Meta inicial (benchmark) |
|---|---|---|
| Retención D7 (en grupo activo) | ¿Vuelven? | > 25-30% |
| DAU / MAU | Hábito | DAU/MAU > 20% (pegajoso) |
| % completa el desafío | Engagement del loop | > 70% de los que entran |
| Grupos creados por invitado | Viralidad (K-factor) | > 0,5 al inicio, apuntar a ≥1 |
| NPS casero | Amor del usuario | > 30 |
| Mensajes en chat / grupo / día | Capa social viva | cualquier cosa > 0 es buena señal |

---

## Fuentes

- [Trivia Games Market — GrowthMarketReports](https://growthmarketreports.com/report/trivia-games-market) · [DataIntelo](https://dataintelo.com/report/trivia-games-market)
- [Mobile Gaming Market — Fortune Business Insights](https://www.fortunebusinessinsights.com/mobile-gaming-market-113099) · [Precedence Research](https://www.precedenceresearch.com/mobile-gaming-market)
- [Latin America Mobile Gaming — IMARC](https://www.imarcgroup.com/latin-america-mobile-gaming-market) · [Cognitive Market Research (South America)](https://www.cognitivemarketresearch.com/regional-analysis/south-america-mobile-and-handheld-gaming-market-report)
- [Trivia Crack — Wikipedia](https://en.wikipedia.org/wiki/Trivia_Crack) · [Sensor Tower](https://app.sensortower.com/overview/651510680?country=US)
- [Wordle success — Axios](https://www.axios.com/2023/03/23/new-york-times-wordle-game-developers-conference)
- [Why HQ Trivia Failed — ScreenRant](https://screenrant.com/why-hq-trivia-failed/) · [productmint](https://productmint.com/what-happened-to-hq-trivia/)
- [Mobile Game Monetization 2026 — Adapty](https://adapty.io/blog/mobile-game-monetization/) · [Udonis stats](https://www.blog.udonis.co/mobile-marketing/mobile-games/mobile-gaming-statistics)
- [Mobile Game Retention Benchmarks — Mistplay](https://business.mistplay.com/resources/mobile-game-retention-benchmarks) · [Business of Apps](https://www.businessofapps.com/data/mobile-game-retention-rates/)
- [K-factor / Viral Loops — First Round Review](https://review.firstround.com/glossary/k-factor-virality/) · [Wikipedia](https://en.wikipedia.org/wiki/K-factor_(marketing))
- [Product-Market Fit / Beta testing — Centercode](https://www.centercode.com/blog/how-to-find-product-market-fit-and-8-ways-to-test-it)
- [Instagram 2026 strategy — Social Media Examiner](https://www.socialmediaexaminer.com/what-clickable-reels-links-and-hashtag-limits-mean-for-your-2026-instagram-strategy/) · [TrueFuture Media](https://www.truefuturemedia.com/articles/instagram-reels-reach-2026-business-growth-guide)

*Nota: las cifras de mercado provienen de reportes de pago (resúmenes públicos); tómalas como orden de magnitud, no como verdad exacta. Distintas consultoras dan números algo distintos.*
