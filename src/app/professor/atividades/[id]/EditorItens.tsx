"use client";

import { useRef } from "react";
import { botaoIcone, botaoTexto, caixaMarcar, campo, rotulo } from "@/components/ui/estilos";
import { LACUNA, novoId, type ExercicioLacuna, type ExercicioMultiplaEscolha } from "@/lib/atividades/modelo";

type ItemLacuna = ExercicioLacuna["itens"][number];
type ItemMultipla = ExercicioMultiplaEscolha["itens"][number];

const campoPequeno = campo.replace("py-2.5", "py-2");

function trocar<T>(lista: T[], indice: number, novo: T) {
  return lista.map((x, i) => (i === indice ? novo : x));
}

function semIndice<T>(lista: T[], indice: number) {
  return lista.filter((_, i) => i !== indice);
}

export function CabecalhoItem({
  numero,
  total,
  onMover,
  onRemover,
}: {
  numero: number;
  total: number;
  onMover: (direcao: -1 | 1) => void;
  onRemover: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <span className="text-xs font-extrabold tracking-wide text-tinta-suave uppercase">Item {numero}</span>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onMover(-1)} disabled={numero === 1} aria-label="Subir item" className={botaoIcone}>
          ↑
        </button>
        <button type="button" onClick={() => onMover(1)} disabled={numero === total} aria-label="Descer item" className={botaoIcone}>
          ↓
        </button>
        <button type="button" onClick={onRemover} disabled={total === 1} aria-label="Apagar item" className={botaoIcone}>
          ✕
        </button>
      </div>
    </div>
  );
}

export function EditorLacuna({ item, onChange }: { item: ItemLacuna; onChange: (item: ItemLacuna) => void }) {
  const frase = useRef<HTMLInputElement>(null);
  const temLacuna = item.enunciado.includes(LACUNA);

  function inserirLacuna() {
    const campoFrase = frase.current;
    const inicio = campoFrase?.selectionStart ?? item.enunciado.length;
    const fim = campoFrase?.selectionEnd ?? inicio;
    const novo = item.enunciado.slice(0, inicio) + LACUNA + item.enunciado.slice(fim);
    onChange({ ...item, enunciado: novo });
    requestAnimationFrame(() => {
      campoFrase?.focus();
      campoFrase?.setSelectionRange(inicio + LACUNA.length, inicio + LACUNA.length);
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <label htmlFor={`frase-${item.id}`} className="text-sm font-bold">
            Frase
          </label>
          <button type="button" onClick={inserirLacuna} disabled={temLacuna} className={`${botaoTexto} disabled:opacity-40`}>
            + Inserir lacuna
          </button>
        </div>
        <input
          ref={frase}
          id={`frase-${item.id}`}
          value={item.enunciado}
          onChange={(e) => onChange({ ...item, enunciado: e.target.value })}
          placeholder="Ex.: Cuando era niño, ___ al parque todos los días."
          className={campo}
        />
        {!temLacuna && (
          <p className="mt-1.5 text-xs text-tinta-suave">
            Escreva a frase e marque o lugar da palavra que falta com {LACUNA} (três sublinhados).
          </p>
        )}
      </div>

      <div>
        <span className={rotulo}>Resposta certa</span>
        <div className="space-y-2">
          {item.aceitas.map((aceita, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={aceita}
                onChange={(e) => onChange({ ...item, aceitas: trocar(item.aceitas, i, e.target.value) })}
                placeholder={i === 0 ? "Ex.: iba" : "Outra forma aceita"}
                aria-label={i === 0 ? "Resposta certa" : `Outra resposta aceita ${i}`}
                className={campoPequeno}
              />
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => onChange({ ...item, aceitas: semIndice(item.aceitas, i) })}
                  aria-label="Remover resposta aceita"
                  className={botaoIcone}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => onChange({ ...item, aceitas: [...item.aceitas, ""] })} className={`${botaoTexto} mt-2`}>
          + Outra forma aceita
        </button>
      </div>

      <label className="flex items-start gap-2.5 rounded-xl bg-suave px-3.5 py-3 text-sm">
        <input
          type="checkbox"
          checked={item.grafiaExata}
          onChange={(e) => onChange({ ...item, grafiaExata: e.target.checked })}
          className={`${caixaMarcar} mt-0.5`}
        />
        <span>
          <strong className="font-bold">Exigir grafia exata.</strong>{" "}
          <span className="text-tinta-suave">
            Marcada, acento ou hífen diferente conta como erro. Desmarcada, conta como certo e avisa a grafia correta.
          </span>
        </span>
      </label>

      <div>
        <span className={rotulo}>Erros previstos</span>
        <p className="-mt-1 mb-2 text-xs text-tinta-suave">
          Respostas erradas comuns e a explicação que o aluno vê quando der cada uma.
        </p>
        <div className="space-y-2">
          {item.errosPrevistos.map((erro, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-[10rem_1fr]">
                <input
                  value={erro.valor}
                  onChange={(e) =>
                    onChange({ ...item, errosPrevistos: trocar(item.errosPrevistos, i, { ...erro, valor: e.target.value }) })
                  }
                  placeholder="Ex.: fui"
                  aria-label={`Erro previsto ${i + 1}`}
                  className={campoPequeno}
                />
                <input
                  value={erro.explicacao}
                  onChange={(e) =>
                    onChange({
                      ...item,
                      errosPrevistos: trocar(item.errosPrevistos, i, { ...erro, explicacao: e.target.value }),
                    })
                  }
                  placeholder="Por que está errado"
                  aria-label={`Explicação do erro ${i + 1}`}
                  className={campoPequeno}
                />
              </div>
              <button
                type="button"
                onClick={() => onChange({ ...item, errosPrevistos: semIndice(item.errosPrevistos, i) })}
                aria-label="Remover erro previsto"
                className={`${botaoIcone} mt-1`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...item, errosPrevistos: [...item.errosPrevistos, { valor: "", explicacao: "" }] })}
          className={`${botaoTexto} mt-2`}
        >
          + Erro previsto
        </button>
      </div>

      <div>
        <label htmlFor={`explicacao-${item.id}`} className={rotulo}>
          Explicação para os outros erros
        </label>
        <textarea
          id={`explicacao-${item.id}`}
          value={item.explicacaoPadrao}
          onChange={(e) => onChange({ ...item, explicacaoPadrao: e.target.value })}
          rows={2}
          placeholder="Ex.: Para hábitos no passado, use o pretérito imperfeito: iba, comía, jugaba."
          className={campo}
        />
      </div>
    </div>
  );
}

export function EditorMultipla({ item, onChange }: { item: ItemMultipla; onChange: (item: ItemMultipla) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`pergunta-${item.id}`} className={rotulo}>
          Pergunta
        </label>
        <input
          id={`pergunta-${item.id}`}
          value={item.enunciado}
          onChange={(e) => onChange({ ...item, enunciado: e.target.value })}
          placeholder="Ex.: Vivo ___ Madrid."
          className={campo}
        />
      </div>

      <fieldset>
        <legend className={rotulo}>Alternativas</legend>
        <p className="-mt-1 mb-2 text-xs text-tinta-suave">Marque a certa. Explique as erradas para o aluno entender o erro.</p>
        <div className="space-y-3">
          {item.alternativas.map((alt, i) => (
            <div
              key={alt.id}
              className={`flex items-start gap-2.5 rounded-xl border-2 p-2.5 ${alt.correta ? "border-certo bg-certo-fundo" : "border-linha"}`}
            >
              <input
                type="radio"
                name={`correta-${item.id}`}
                checked={alt.correta}
                onChange={() =>
                  onChange({ ...item, alternativas: item.alternativas.map((a) => ({ ...a, correta: a.id === alt.id })) })
                }
                aria-label={`Alternativa ${i + 1} é a certa`}
                className={`${caixaMarcar} mt-3`}
              />
              <div className="grid flex-1 gap-2">
                <input
                  value={alt.texto}
                  onChange={(e) => onChange({ ...item, alternativas: trocar(item.alternativas, i, { ...alt, texto: e.target.value }) })}
                  placeholder={`Alternativa ${i + 1}`}
                  aria-label={`Texto da alternativa ${i + 1}`}
                  className={campoPequeno}
                />
                <input
                  value={alt.explicacao ?? ""}
                  onChange={(e) =>
                    onChange({ ...item, alternativas: trocar(item.alternativas, i, { ...alt, explicacao: e.target.value }) })
                  }
                  placeholder={alt.correta ? "Comentário quando acertar (opcional)" : "Por que está errada"}
                  aria-label={`Explicação da alternativa ${i + 1}`}
                  className={`${campoPequeno} text-sm`}
                />
              </div>
              <button
                type="button"
                onClick={() => onChange({ ...item, alternativas: semIndice(item.alternativas, i) })}
                disabled={item.alternativas.length <= 2}
                aria-label="Remover alternativa"
                className={`${botaoIcone} mt-1.5`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...item, alternativas: [...item.alternativas, { id: novoId(), texto: "", correta: false }] })}
          className={`${botaoTexto} mt-2`}
        >
          + Alternativa
        </button>
      </fieldset>

      <div>
        <label htmlFor={`explicacao-${item.id}`} className={rotulo}>
          Explicação geral
        </label>
        <textarea
          id={`explicacao-${item.id}`}
          value={item.explicacaoPadrao}
          onChange={(e) => onChange({ ...item, explicacaoPadrao: e.target.value })}
          rows={2}
          placeholder="Aparece quando a alternativa errada não tem explicação própria."
          className={campo}
        />
      </div>
    </div>
  );
}
