/** CSV com separador ";" (padrão pt-BR/Excel). Escapa aspas, ";" e quebras. */
export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (value: string | number): string => {
    const text = String(value);
    return /["\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [headers, ...rows].map((row) => row.map(escape).join(";")).join("\r\n");
}

/** Baixa um CSV no cliente. BOM UTF-8 para o Excel ler acentos corretamente. */
export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
