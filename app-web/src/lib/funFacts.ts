// Datos curiosos del día. Sin base de datos: se elige uno por fecha de forma
// determinista, así todos ven el mismo dato cada día.
export const FUN_FACTS: string[] = [
  "Los pulpos tienen tres corazones y sangre azul.",
  "La miel nunca se echa a perder: se ha encontrado miel comestible de hace más de 3000 años.",
  "Un rayo puede ser más caliente que la superficie del Sol.",
  "Los flamencos son rosados por lo que comen: camarones y algas.",
  "La Torre Eiffel puede crecer hasta 15 cm en verano por la dilatación del metal.",
  "Los plátanos son, botánicamente, bayas; las frutillas no.",
  "Un día en Venus dura más que un año en Venus.",
  "Las nutrias se toman de las manos al dormir para no separarse.",
  "El ojo humano puede distinguir cerca de 10 millones de colores.",
  "Los tiburones existen desde antes que los árboles.",
  "Hay más estrellas en el universo que granos de arena en todas las playas de la Tierra.",
  "Los koalas tienen huellas dactilares casi idénticas a las humanas.",
  "Saturno es tan poco denso que flotaría en el agua.",
  "El corazón humano late unas 100.000 veces al día.",
  "La jirafa y el humano tienen el mismo número de vértebras en el cuello: siete.",
  "Las abejas pueden reconocer rostros humanos.",
  "El sonido no se propaga en el vacío del espacio.",
  "La Antártida es el desierto más grande del mundo.",
  "Los delfines se ponen 'nombres': usan silbidos únicos para identificarse.",
  "La Luna se aleja de la Tierra unos 3,8 cm cada año.",
  "Los aztecas usaban semillas de cacao como moneda.",
  "Los caracoles pueden dormir durante varios meses seguidos.",
  "El cerebro humano genera suficiente electricidad para encender una ampolleta pequeña.",
  "El monte Everest crece unos pocos milímetros cada año.",
  "Un grupo de flamencos se llama 'flamboyant'.",
  "El idioma con más hablantes nativos en el mundo es el chino mandarín.",
  "Los pingüinos pueden saltar hasta casi dos metros fuera del agua.",
  "El agua caliente puede congelarse más rápido que la fría en ciertas condiciones.",
  "Marte tiene el volcán más alto conocido del sistema solar: el Monte Olimpo.",
  "Una cucharadita de estrella de neutrones pesaría miles de millones de toneladas.",
];

export function getFactOfDay(date: Date = new Date()): string {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayOfYear = Math.floor((today - start) / 86_400_000);
  return FUN_FACTS[dayOfYear % FUN_FACTS.length];
}
