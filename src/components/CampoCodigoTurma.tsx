import { irParaCodigo } from "@/app/t/[codigo]/actions";
import { botaoSecundario, campo } from "@/components/ui/estilos";

/** "Tenho um código": o aluno digita o código que o professor mostrou e entra na turma. */
export function CampoCodigoTurma({ invalido }: { invalido?: boolean }) {
  return (
    <form action={irParaCodigo} className="mt-6 rounded-2xl bg-suave p-4">
      <label htmlFor="codigo-turma" className="text-sm font-bold">
        Tem o código de uma turma?
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="codigo-turma"
          name="codigo"
          required
          maxLength={8}
          autoComplete="off"
          autoCapitalize="characters"
          placeholder="Ex.: Q2Q ZQ5"
          className={`${campo} font-mono tracking-widest uppercase`}
        />
        <button type="submit" className={`${botaoSecundario} shrink-0`}>
          Entrar
        </button>
      </div>
      {invalido && (
        <p role="alert" className="mt-2 text-sm text-erro">
          Esse código não parece certo. São 6 letras e números.
        </p>
      )}
    </form>
  );
}
