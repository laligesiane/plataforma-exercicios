"use client";

import { useEffect, useState } from "react";
import { useFoco } from "@/components/foco/FocoProvider";
import { PlantaFoco } from "@/components/PlantaFoco";
import { botaoPrimario, botaoSecundario } from "@/components/ui/estilos";
import { DURACAO_PADRAO, DURACOES_MIN, FASES, ULTIMA_FASE, faseDoProgresso, formatarTempo, progressoDa, restanteDa } from "@/lib/foco";

/**
 * Página do modo foco: escolhe o tempo e acompanha o Brotinho crescendo.
 * A sessão continua quando o aluno sai daqui para estudar em outras páginas da Repasa;
 * lá ele vê o mini-Brotinho no canto da tela.
 */
export function ModoFoco() {
  const { sessao, agora, jardim, concluida, iniciar, pausar, retomar, desistir, dispensarConclusao } = useFoco();
  const [duracao, setDuracao] = useState<number>(DURACAO_PADRAO);

  // Quem vê a comemoração aqui não precisa vê-la de novo no mini-Brotinho.
  useEffect(() => {
    if (concluida !== null) return () => dispensarConclusao();
  }, [concluida, dispensarConclusao]);

  const pausado = sessao?.fimEm === null;
  const restante = sessao ? restanteDa(sessao, agora) : duracao * 60_000;
  const fase = sessao ? faseDoProgresso(progressoDa(sessao, agora)) : concluida !== null ? ULTIMA_FASE : 0;

  let frase: string;
  if (concluida !== null && !sessao) frase = `Sessão de ${concluida} minutos concluída. Você plantou uma árvore!`;
  else if (!sessao) frase = "Plante a sementinha e comece a estudar.";
  else if (pausado) frase = "Pausado. O Brotinho está tirando um cochilo.";
  else frase = FASES[fase].frase;

  return (
    <div className="mt-8 flex flex-col items-center text-center">
      <div className="w-full rounded-3xl bg-primaria-suave px-4 pt-6 pb-5">
        <div key={fase} className="foco-nova-fase mx-auto w-fit">
          <PlantaFoco fase={fase} pausado={!sessao ? concluida === null : pausado} tamanho={220} />
        </div>
        <p className="mt-2 text-sm font-bold text-primaria">{FASES[fase].nome}</p>
      </div>

      <p className="mt-6 text-6xl font-extrabold tabular-nums tracking-tight">{formatarTempo(concluida !== null && !sessao ? 0 : restante)}</p>
      <p role="status" aria-live="polite" className="mt-2 min-h-6 font-semibold text-tinta-suave">
        {frase}
      </p>

      {!sessao && (
        <fieldset className="mt-6">
          <legend className="mb-2 text-sm font-bold">Quanto tempo?</legend>
          <div className="flex flex-wrap justify-center gap-2">
            {DURACOES_MIN.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={duracao === m}
                onClick={() => {
                  setDuracao(m);
                  dispensarConclusao();
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                  duracao === m ? "bg-tinta text-fundo" : "border border-linha text-tinta-suave hover:border-tinta hover:text-tinta"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {!sessao && (
          <button type="button" className={botaoPrimario} onClick={() => iniciar(duracao)}>
            {concluida !== null ? "Plantar outra" : "Começar a estudar"}
          </button>
        )}
        {sessao && (
          <button type="button" className={pausado ? botaoPrimario : botaoSecundario} onClick={pausado ? retomar : pausar}>
            {pausado ? "Continuar" : "Pausar"}
          </button>
        )}
        {sessao && (
          <button type="button" className={botaoSecundario} onClick={desistir}>
            Desistir
          </button>
        )}
      </div>

      <div className="mt-8 w-full rounded-2xl bg-suave p-4 text-left text-sm text-tinta-suave">
        <p>
          <strong className="text-tinta">Pode navegar à vontade.</strong> Abra seus resumos, mapas e atividades: o tempo continua e o Brotinho
          te acompanha no canto da tela. Enquanto o foco está ligado, a Repasa não te interrompe com avisos.
        </p>
        <p className="mt-2">
          Para silenciar as notificações de outros apps, ligue o <strong className="text-tinta">Não perturbe</strong> do seu computador ou
          celular.
        </p>
      </div>

      {jardim && jardim.arvores > 0 && (
        <section className="mt-6 w-full rounded-2xl border border-linha p-4 text-left">
          <h2 className="font-extrabold">Seu jardim de hoje</h2>
          <p className="text-sm text-tinta-suave">
            {jardim.arvores} {jardim.arvores === 1 ? "árvore" : "árvores"} · {jardim.minutos} minutos de estudo
          </p>
          <ul className="mt-3 flex flex-wrap gap-1" aria-hidden>
            {Array.from({ length: Math.min(jardim.arvores, 24) }, (_, i) => (
              <li key={i}>
                <PlantaFoco fase={ULTIMA_FASE} tamanho={44} animado={false} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
