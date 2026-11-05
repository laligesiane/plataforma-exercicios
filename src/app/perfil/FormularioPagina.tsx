"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { IconeRede } from "@/components/IconeRede";
import { Mensagem } from "@/components/ui/Mensagem";
import { botaoPrimario, caixaMarcar, campo, rotulo } from "@/components/ui/estilos";
import { formatarTelefone, infoRedes, MODALIDADES, normalizarApelido, REDES, type Rede } from "@/lib/paginaProfessor";
import { coresResumo, lerCorResumo } from "@/lib/resumos";
import { salvarPaginaProfessor } from "./actions-pagina";

export type PaginaSalva = {
  apelido: string;
  nome: string;
  bio: string;
  materias: string;
  contato: string;
  publicada: boolean;
  // Campos da 0038: podem faltar enquanto o SQL não roda.
  destaque?: string;
  ensina_desde?: number | null;
  formacao?: string;
  modalidade?: string;
  cidade?: string;
  cor?: string;
} & Partial<Record<Rede, string>>;

/** Prefixo mostrado antes do campo, para o professor ver que só precisa do usuário. */
const prefixos: Record<Rede, string> = {
  whatsapp: "",
  instagram: "@",
  tiktok: "@",
  facebook: "facebook.com/",
  youtube: "@",
};

/** WhatsApp salvo como 5511912345678 volta para o campo como (11) 91234-5678. */
function valorInicial(rede: Rede, valor = "") {
  if (rede !== "whatsapp" || !valor) return valor;
  return valor.startsWith("55") ? formatarTelefone(valor) : `+${valor}`;
}

function Subtitulo({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-2 text-sm font-extrabold tracking-wide text-tinta-suave uppercase">{children}</h3>;
}

export function FormularioPagina({ pagina, nomePadrao }: { pagina: PaginaSalva | null; nomePadrao: string }) {
  const [estado, acao, enviando] = useActionState(salvarPaginaProfessor, null);
  const [apelido, setApelido] = useState(pagina?.apelido ?? normalizarApelido(nomePadrao));
  const [cor, setCor] = useState(lerCorResumo(pagina?.cor));
  const anoAtual = new Date().getFullYear();

  return (
    <form action={acao} className="space-y-4">
      <Subtitulo>Apresentação</Subtitulo>
      <div>
        <label htmlFor="apelido" className={rotulo}>
          Endereço da página
        </label>
        <div className="flex items-center gap-1">
          <span className="shrink-0 text-sm text-tinta-suave">repasa.com.br/p/</span>
          <input
            id="apelido"
            name="apelido"
            value={apelido}
            onChange={(e) => setApelido(e.target.value.toLowerCase())}
            onBlur={() => setApelido(normalizarApelido(apelido))}
            required
            minLength={3}
            maxLength={40}
            className={campo}
          />
        </div>
      </div>
      <div>
        <label htmlFor="pagina-nome" className={rotulo}>
          Nome na página
        </label>
        <input id="pagina-nome" name="nome" defaultValue={pagina?.nome ?? nomePadrao} required maxLength={80} className={campo} />
        <p className="mt-1 text-xs text-tinta-suave">A foto da página é a mesma do seu perfil, lá em cima.</p>
      </div>
      <div>
        <label htmlFor="destaque" className={rotulo}>
          Frase de destaque
        </label>
        <input
          id="destaque"
          name="destaque"
          defaultValue={pagina?.destaque ?? ""}
          maxLength={120}
          placeholder="Ex.: Aulas leves e práticas, do básico ao avançado"
          className={campo}
        />
      </div>
      <div>
        <label htmlFor="bio" className={rotulo}>
          Sobre você
        </label>
        <textarea id="bio" name="bio" defaultValue={pagina?.bio ?? ""} maxLength={1500} rows={5} placeholder="Quem você é, como são suas aulas, para quem elas servem…" className={campo} />
      </div>

      <Subtitulo>Suas aulas</Subtitulo>
      <div>
        <label htmlFor="materias" className={rotulo}>
          O que você ensina
        </label>
        <input id="materias" name="materias" defaultValue={pagina?.materias ?? ""} maxLength={200} placeholder="Ex.: Matemática para o ENEM, inglês para adultos" className={campo} />
        <p className="mt-1 text-xs text-tinta-suave">Separe por vírgula: cada matéria vira uma etiqueta na página.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ensina_desde" className={rotulo}>
            Ensina desde (ano)
          </label>
          <input
            id="ensina_desde"
            name="ensina_desde"
            type="number"
            inputMode="numeric"
            min={1950}
            max={anoAtual}
            defaultValue={pagina?.ensina_desde ?? ""}
            placeholder={`Ex.: ${anoAtual - 5}`}
            className={campo}
          />
        </div>
        <div>
          <label htmlFor="modalidade" className={rotulo}>
            Como são as aulas
          </label>
          <select id="modalidade" name="modalidade" defaultValue={pagina?.modalidade ?? ""} className={campo}>
            <option value="">Prefiro não dizer</option>
            {Object.entries(MODALIDADES).map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="cidade" className={rotulo}>
          Cidade
        </label>
        <input id="cidade" name="cidade" defaultValue={pagina?.cidade ?? ""} maxLength={80} placeholder="Ex.: Recife, PE" className={campo} />
      </div>
      <div>
        <label htmlFor="formacao" className={rotulo}>
          Formação e certificados
        </label>
        <textarea
          id="formacao"
          name="formacao"
          defaultValue={pagina?.formacao ?? ""}
          maxLength={300}
          rows={3}
          placeholder={"Uma por linha. Ex.:\nLicenciatura em Matemática (UFPE)\nCertificado de inglês C1"}
          className={campo}
        />
      </div>

      <Subtitulo>Redes sociais e contato</Subtitulo>
      <p className="-mt-2 text-sm text-tinta-suave">Digite só o seu usuário (ou o número, no WhatsApp). A Repasa monta o link certinho.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {REDES.map((rede) => (
          <div key={rede}>
            <label htmlFor={`rede-${rede}`} className={`${rotulo} flex items-center gap-1.5`}>
              <IconeRede rede={rede} className="size-4" />
              {infoRedes[rede].nome}
            </label>
            <div className="flex items-center rounded-xl border-2 border-linha bg-suave transition-colors focus-within:border-primaria focus-within:bg-fundo">
              {prefixos[rede] && <span className="shrink-0 pl-3.5 text-sm text-tinta-suave">{prefixos[rede]}</span>}
              <input
                id={`rede-${rede}`}
                name={rede}
                defaultValue={valorInicial(rede, pagina?.[rede])}
                maxLength={200}
                inputMode={rede === "whatsapp" ? "tel" : undefined}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder={infoRedes[rede].exemplo}
                className={`w-full min-w-0 bg-transparent py-2.5 pr-3.5 outline-none ${prefixos[rede] ? "pl-1" : "pl-3.5"}`}
              />
            </div>
          </div>
        ))}
      </div>
      <div>
        <label htmlFor="contato" className={rotulo}>
          E-mail ou site
        </label>
        <input id="contato" name="contato" defaultValue={pagina?.contato ?? ""} maxLength={200} placeholder="Ex.: ana@email.com ou https://meusite.com.br" className={campo} />
      </div>

      <Subtitulo>Cor da página</Subtitulo>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cor da página">
        {Object.entries(coresResumo).map(([valor, { nome, amostra }]) => (
          <label key={valor} className="cursor-pointer">
            <input type="radio" name="cor" value={valor} checked={cor === valor} onChange={() => setCor(lerCorResumo(valor))} className="peer sr-only" />
            <span className="flex items-center gap-2 rounded-full border-2 border-linha px-3 py-1.5 text-sm font-bold peer-checked:border-tinta peer-focus-visible:outline-2 peer-focus-visible:outline-primaria">
              <span className="size-4 rounded-full" style={{ background: amostra }} aria-hidden />
              {nome}
            </span>
          </label>
        ))}
      </div>

      <label className="flex items-center gap-2 pt-2 text-sm font-semibold">
        <input type="checkbox" name="publicada" defaultChecked={pagina?.publicada ?? false} className={caixaMarcar} />
        Deixar a página no ar
      </label>
      <Mensagem estado={estado} />
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={enviando} className={botaoPrimario}>
          {enviando ? "Salvando..." : "Salvar página"}
        </button>
        {pagina && (
          <Link href={`/p/${pagina.apelido}`} className="text-sm font-bold text-primaria hover:underline">
            Ver minha página
          </Link>
        )}
      </div>
    </form>
  );
}
