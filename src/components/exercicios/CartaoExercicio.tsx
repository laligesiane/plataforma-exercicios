import type { Midia } from "@/lib/atividades/midia";
import { MidiaExercicio } from "./MidiaExercicio";

type Props = {
  numero: number;
  titulo: string;
  instrucoes: string;
  midia?: Midia;
  children: React.ReactNode;
};

export function CartaoExercicio({ numero, titulo, instrucoes, midia, children }: Props) {
  return (
    <section className="rounded-2xl border border-linha bg-fundo p-5 sm:p-6">
      <header className="mb-4 flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primaria-suave text-sm font-extrabold text-primaria">
          {numero}
        </span>
        <div>
          <h2 className="text-[17px] font-bold">{titulo}</h2>
          <p className="text-sm text-tinta-suave">{instrucoes}</p>
        </div>
      </header>
      <MidiaExercicio midia={midia} />
      <div className="divide-y divide-linha">{children}</div>
    </section>
  );
}
