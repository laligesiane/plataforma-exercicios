/** Lista "Para fazer" do aluno: atividades das turmas ainda não enviadas e compromissos não feitos. */

export type Pendencia = {
  chave: string;
  origem: "atividade" | "compromisso";
  titulo: string;
  detalhe: string;
  /** "AAAA-MM-DD" ou null quando não tem prazo. */
  data: string | null;
  href: string;
};

export type AtividadeAluno = { id: string; titulo: string; prazo: string | null; turma: string };
export type CompromissoAluno = { id: string; titulo: string; data: string; feito: boolean; tipo: string; materia: string };

/** Com prazo primeiro (do mais próximo), depois as sem prazo. Atividades já enviadas e compromissos feitos ficam de fora. */
export function montarParaFazer(atividades: AtividadeAluno[], enviadas: Set<string>, compromissos: CompromissoAluno[]): Pendencia[] {
  const lista: Pendencia[] = [
    ...atividades
      .filter((a) => !enviadas.has(a.id))
      .map((a) => ({
        chave: `a-${a.id}`,
        origem: "atividade" as const,
        titulo: a.titulo,
        detalhe: a.turma,
        data: a.prazo,
        href: `/atividades/${a.id}`,
      })),
    ...compromissos
      .filter((c) => !c.feito)
      .map((c) => ({
        chave: `c-${c.id}`,
        origem: "compromisso" as const,
        titulo: c.titulo,
        detalhe: c.materia || "Minha agenda",
        data: c.data,
        href: "/aluno/agenda",
      })),
  ];
  return lista.sort((x, y) => {
    if (x.data && y.data) return x.data.localeCompare(y.data);
    if (x.data) return -1;
    if (y.data) return 1;
    return x.titulo.localeCompare(y.titulo);
  });
}

/** "Atrasada", "Hoje", "Amanhã" ou "Até 12/11", conforme a data e hoje. */
export function rotuloPrazo(data: string | null, hoje: string): { texto: string; atrasado: boolean } | null {
  if (!data) return null;
  if (data < hoje) return { texto: "Atrasada", atrasado: true };
  if (data === hoje) return { texto: "Hoje", atrasado: false };
  const [a, m, d] = hoje.split("-").map(Number);
  const amanha = new Date(Date.UTC(a, m - 1, d + 1)).toISOString().slice(0, 10);
  if (data === amanha) return { texto: "Amanhã", atrasado: false };
  const [, mm, dd] = data.split("-");
  return { texto: `Até ${dd}/${mm}`, atrasado: false };
}
