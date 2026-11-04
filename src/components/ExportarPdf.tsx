/** Menu "Exportar PDF": só o resumo, só o mapa mental ou os dois no mesmo arquivo. */
export function ExportarPdf({ id, temTexto, temMapa }: { id: string; temTexto: boolean; temMapa: boolean }) {
  const opcoes = [
    temTexto && temMapa && { incluir: "tudo", rotulo: "Resumo e mapa mental", dica: "Os dois no mesmo arquivo" },
    temTexto && { incluir: "resumo", rotulo: "Só o resumo", dica: "Texto com títulos e notas" },
    temMapa && { incluir: "mapa", rotulo: "Só o mapa mental", dica: "Uma página com o mapa" },
  ].filter(Boolean) as { incluir: string; rotulo: string; dica: string }[];
  if (opcoes.length === 0) return null;

  return (
    <details className="relative">
      <summary className="cursor-pointer list-none text-sm font-bold text-primaria hover:underline">
        Exportar PDF ▾
      </summary>
      <ul className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-linha bg-fundo p-1.5 shadow-lg">
        {opcoes.map((o) => (
          <li key={o.incluir}>
            <a
              href={`/resumos/${id}/pdf?incluir=${o.incluir}`}
              target="_blank"
              rel="noopener"
              className="block rounded-xl px-3 py-2 hover:bg-suave"
            >
              <span className="block text-sm font-bold">{o.rotulo}</span>
              <span className="block text-xs text-tinta-suave">{o.dica}</span>
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
