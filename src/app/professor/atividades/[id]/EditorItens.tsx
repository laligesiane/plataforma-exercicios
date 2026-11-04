"use client";

import { useRef } from "react";
import { botaoIcone, botaoTexto, caixaMarcar, campo, rotulo } from "@/components/ui/estilos";
import {
  LACUNA,
  novoId,
  type Coluna,
  type ExercicioArrastar,
  type ExercicioClassificar,
  type ExercicioLacuna,
  type ExercicioMultiplaEscolha,
  type ExercicioProducao,
  type ExercicioRelacionar,
} from "@/lib/atividades/modelo";
import { ImagemDoCartao } from "./EditorMidia";

type ItemLacuna = ExercicioLacuna["itens"][number];
type ItemMultipla = ExercicioMultiplaEscolha["itens"][number];
type ItemArrastar = ExercicioArrastar["itens"][number];
type ItemClassificar = ExercicioClassificar["itens"][number];
type ItemRelacionar = ExercicioRelacionar["itens"][number];
type ItemProducao = ExercicioProducao["itens"][number];

const campoPequeno = campo.replace("py-2.5", "py-2");

export function trocar<T>(lista: T[], indice: number, novo: T) {
  return lista.map((x, i) => (i === indice ? novo : x));
}

export function semIndice<T>(lista: T[], indice: number) {
  return lista.filter((_, i) => i !== indice);
}

export function CabecalhoItem({
  numero,
  total,
  rotulo: nome = "Item",
  onMover,
  onRemover,
}: {
  numero: number;
  total: number;
  rotulo?: string;
  onMover: (direcao: -1 | 1) => void;
  onRemover: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <span className="text-xs font-extrabold tracking-wide text-tinta-suave uppercase">
        {nome} {numero}
      </span>
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

/** Frase com o botão que insere a marca da lacuna onde está o cursor. */
function CampoFrase({ id, valor, onChange }: { id: string; valor: string; onChange: (v: string) => void }) {
  const frase = useRef<HTMLInputElement>(null);
  const temLacuna = valor.includes(LACUNA);

  function inserirLacuna() {
    const campoFrase = frase.current;
    const inicio = campoFrase?.selectionStart ?? valor.length;
    const fim = campoFrase?.selectionEnd ?? inicio;
    onChange(valor.slice(0, inicio) + LACUNA + valor.slice(fim));
    requestAnimationFrame(() => {
      campoFrase?.focus();
      campoFrase?.setSelectionRange(inicio + LACUNA.length, inicio + LACUNA.length);
    });
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={`frase-${id}`} className="text-sm font-bold">
          Frase
        </label>
        <button type="button" onClick={inserirLacuna} disabled={temLacuna} className={`${botaoTexto} disabled:opacity-40`}>
          + Inserir lacuna
        </button>
      </div>
      <input
        ref={frase}
        id={`frase-${id}`}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex.: Cuando era niño, ___ al parque todos los días."
        className={campo}
      />
      {!temLacuna && (
        <p className="mt-1.5 text-xs text-tinta-suave">
          Escreva a frase e marque o lugar da palavra que falta com {LACUNA} (três sublinhados).
        </p>
      )}
    </div>
  );
}

type Erro = { valor: string; explicacao: string };

/** Respostas erradas comuns, cada uma com a explicação que o aluno vê. */
function ListaErros({ erros, onChange, exemplo }: { erros: Erro[]; onChange: (e: Erro[]) => void; exemplo: string }) {
  return (
    <div>
      <span className={rotulo}>Erros previstos</span>
      <p className="-mt-1 mb-2 text-xs text-tinta-suave">Respostas erradas comuns e a explicação que o aluno vê quando der cada uma.</p>
      <div className="space-y-2">
        {erros.map((erro, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="grid flex-1 gap-2 sm:grid-cols-[10rem_1fr]">
              <input
                value={erro.valor}
                onChange={(e) => onChange(trocar(erros, i, { ...erro, valor: e.target.value }))}
                placeholder={`Ex.: ${exemplo}`}
                aria-label={`Erro previsto ${i + 1}`}
                className={campoPequeno}
              />
              <input
                value={erro.explicacao}
                onChange={(e) => onChange(trocar(erros, i, { ...erro, explicacao: e.target.value }))}
                placeholder="Por que está errado"
                aria-label={`Explicação do erro ${i + 1}`}
                className={campoPequeno}
              />
            </div>
            <button type="button" onClick={() => onChange(semIndice(erros, i))} aria-label="Remover erro previsto" className={`${botaoIcone} mt-1`}>
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...erros, { valor: "", explicacao: "" }])} className={`${botaoTexto} mt-2`}>
        + Erro previsto
      </button>
    </div>
  );
}

function CampoExplicacao({
  id,
  rotuloTexto,
  valor,
  onChange,
  exemplo,
}: {
  id: string;
  rotuloTexto: string;
  valor: string;
  onChange: (v: string) => void;
  exemplo: string;
}) {
  return (
    <div>
      <label htmlFor={`explicacao-${id}`} className={rotulo}>
        {rotuloTexto}
      </label>
      <textarea id={`explicacao-${id}`} value={valor} onChange={(e) => onChange(e.target.value)} rows={2} placeholder={exemplo} className={campo} />
    </div>
  );
}

export function EditorLacuna({ item, onChange }: { item: ItemLacuna; onChange: (item: ItemLacuna) => void }) {
  return (
    <div className="space-y-4">
      <CampoFrase id={item.id} valor={item.enunciado} onChange={(enunciado) => onChange({ ...item, enunciado })} />

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

      <ListaErros erros={item.errosPrevistos} onChange={(errosPrevistos) => onChange({ ...item, errosPrevistos })} exemplo="fui" />

      <CampoExplicacao
        id={item.id}
        rotuloTexto="Explicação para os outros erros"
        valor={item.explicacaoPadrao}
        onChange={(explicacaoPadrao) => onChange({ ...item, explicacaoPadrao })}
        exemplo="Ex.: Para hábitos no passado, use o pretérito imperfeito: iba, comía, jugaba."
      />
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

export function EditorArrastar({ item, onChange }: { item: ItemArrastar; onChange: (item: ItemArrastar) => void }) {
  return (
    <div className="space-y-4">
      <CampoFrase id={item.id} valor={item.enunciado} onChange={(enunciado) => onChange({ ...item, enunciado })} />
      <div>
        <label htmlFor={`resposta-${item.id}`} className={rotulo}>
          Palavra certa
        </label>
        <input
          id={`resposta-${item.id}`}
          value={item.resposta}
          onChange={(e) => onChange({ ...item, resposta: e.target.value })}
          placeholder="Ex.: iba"
          className={campoPequeno}
        />
        <p className="mt-1.5 text-xs text-tinta-suave">Ela entra no banco de palavras automaticamente.</p>
      </div>
      <ListaErros erros={item.errosPrevistos} onChange={(errosPrevistos) => onChange({ ...item, errosPrevistos })} exemplo="fui" />
      <CampoExplicacao
        id={item.id}
        rotuloTexto="Explicação para os outros erros"
        valor={item.explicacaoPadrao}
        onChange={(explicacaoPadrao) => onChange({ ...item, explicacaoPadrao })}
        exemplo="Ex.: Para hábitos no passado, use o pretérito imperfeito."
      />
    </div>
  );
}

export function EditorClassificar({
  item,
  colunas,
  onChange,
}: {
  item: ItemClassificar;
  colunas: Coluna[];
  onChange: (item: ItemClassificar) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
        <div>
          <label htmlFor={`texto-${item.id}`} className={rotulo}>
            Cartão
          </label>
          <input
            id={`texto-${item.id}`}
            value={item.texto}
            onChange={(e) => onChange({ ...item, texto: e.target.value })}
            placeholder="Ex.: Madrid"
            className={campoPequeno}
          />
        </div>
        <div>
          <label htmlFor={`coluna-${item.id}`} className={rotulo}>
            Coluna certa
          </label>
          <select
            id={`coluna-${item.id}`}
            value={item.colunaId}
            onChange={(e) => onChange({ ...item, colunaId: e.target.value })}
            className={campoPequeno}
          >
            <option value="" disabled>
              Escolha
            </option>
            {colunas.map((c, i) => (
              <option key={c.id} value={c.id}>
                {c.nome || `Coluna ${i + 1}`}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor={`explicacao-${item.id}`} className={rotulo}>
          Por que vai nessa coluna
        </label>
        <input
          id={`explicacao-${item.id}`}
          value={item.explicacao}
          onChange={(e) => onChange({ ...item, explicacao: e.target.value })}
          placeholder="O aluno vê isto se puser o cartão na coluna errada."
          className={campoPequeno}
        />
      </div>
      <ImagemDoCartao
        imagem={item.imagem}
        onChange={(imagem) => {
          const { imagem: _antiga, ...resto } = item;
          void _antiga;
          onChange(imagem ? { ...resto, imagem } : resto);
        }}
      />
    </div>
  );
}

export function EditorRelacionar({ item, onChange }: { item: ItemRelacionar; onChange: (item: ItemRelacionar) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`esquerda-${item.id}`} className={rotulo}>
            Esquerda
          </label>
          <input
            id={`esquerda-${item.id}`}
            value={item.esquerda}
            onChange={(e) => onChange({ ...item, esquerda: e.target.value })}
            placeholder="Ex.: perro"
            className={campoPequeno}
          />
        </div>
        <div>
          <label htmlFor={`direita-${item.id}`} className={rotulo}>
            Par certo
          </label>
          <input
            id={`direita-${item.id}`}
            value={item.direita}
            onChange={(e) => onChange({ ...item, direita: e.target.value })}
            placeholder="Ex.: cachorro"
            className={campoPequeno}
          />
        </div>
      </div>
      <div>
        <label htmlFor={`explicacao-${item.id}`} className={rotulo}>
          Explicação se errar o par
        </label>
        <input
          id={`explicacao-${item.id}`}
          value={item.explicacao}
          onChange={(e) => onChange({ ...item, explicacao: e.target.value })}
          placeholder="Ex.: 'Perro' é cachorro; 'gato' é o mesmo nas duas línguas."
          className={campoPequeno}
        />
      </div>
    </div>
  );
}

export function EditorProducao({ item, onChange }: { item: ItemProducao; onChange: (item: ItemProducao) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Como o aluno responde">
        {(
          [
            ["escrita", "✎ Escrita"],
            ["oral", "🎙 Oral (gravação)"],
          ] as const
        ).map(([modo, texto]) => (
          <button
            key={modo}
            type="button"
            aria-pressed={item.modo === modo}
            onClick={() => onChange({ ...item, modo })}
            className={`rounded-full border-2 px-3.5 py-1 text-sm font-bold transition-colors ${item.modo === modo ? "border-primaria bg-primaria-suave text-primaria" : "border-linha text-tinta-suave hover:border-tinta"}`}
          >
            {texto}
          </button>
        ))}
      </div>
      <div>
        <label htmlFor={`enunciado-${item.id}`} className={rotulo}>
          Proposta
        </label>
        <textarea
          id={`enunciado-${item.id}`}
          value={item.enunciado}
          onChange={(e) => onChange({ ...item, enunciado: e.target.value })}
          rows={3}
          placeholder={
            item.modo === "oral"
              ? "Ex.: Grave um áudio contando o que você fazia nas férias quando era criança."
              : "Ex.: Escreva 5 frases sobre o que você fazia nas férias quando era criança."
          }
          className={campoPequeno}
        />
      </div>
      <div>
        <label htmlFor={`orientacao-${item.id}`} className={rotulo}>
          O que você espera <span className="font-normal text-tinta-suave">(só você vê, para ajudar na correção)</span>
        </label>
        <input
          id={`orientacao-${item.id}`}
          value={item.orientacao}
          onChange={(e) => onChange({ ...item, orientacao: e.target.value })}
          placeholder="Ex.: Uso do pretérito imperfeito; pelo menos 5 frases."
          className={campoPequeno}
        />
      </div>
    </div>
  );
}

/** Lista de palavras curtas (palavras extras do banco, nomes de colunas). */
export function ListaCurta({
  rotuloTexto,
  dica,
  valores,
  onChange,
  exemplo,
  minimo = 0,
  textoAdicionar,
}: {
  rotuloTexto: string;
  dica: string;
  valores: string[];
  onChange: (v: string[]) => void;
  exemplo: string;
  minimo?: number;
  textoAdicionar: string;
}) {
  return (
    <div className="rounded-xl bg-suave p-4">
      <span className={rotulo}>{rotuloTexto}</span>
      <p className="-mt-1 mb-2 text-xs text-tinta-suave">{dica}</p>
      <div className="flex flex-wrap gap-2">
        {valores.map((v, i) => (
          <div key={i} className="flex items-center gap-1">
            <input
              value={v}
              onChange={(e) => onChange(trocar(valores, i, e.target.value))}
              placeholder={exemplo}
              aria-label={`${rotuloTexto} ${i + 1}`}
              className="w-36 rounded-xl border-2 border-linha bg-fundo px-3 py-1.5 outline-none focus:border-primaria"
            />
            <button
              type="button"
              onClick={() => onChange(semIndice(valores, i))}
              disabled={valores.length <= minimo}
              aria-label="Remover"
              className={botaoIcone}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...valores, ""])} className={`${botaoTexto} mt-2`}>
        {textoAdicionar}
      </button>
    </div>
  );
}
