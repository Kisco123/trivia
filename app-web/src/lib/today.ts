/** Fecha de hoy en horario de Chile (America/Santiago), formato YYYY-MM-DD.
 *  El servidor (RPCs current_streak/group_ranking) usa la misma zona, así el
 *  desafío diario y la racha cambian a medianoche local, no a las 20:00. */
export function todayString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(date);
}
