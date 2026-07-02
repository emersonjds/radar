/** ISO date (YYYY-MM-DD) → dd/mm/yyyy. */
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** ISO date → "2 de julho de 2026" (pt-BR, UTC to avoid TZ drift). */
export function formatarDataExtenso(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function formatarPercentual(valor: number): string {
  return `${valor}%`;
}
