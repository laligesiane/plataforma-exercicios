import { botaoPrimario } from "@/components/ui/estilos";
import { criarAtividade } from "./actions";

export function BotaoNovaAtividade() {
  return (
    <form action={criarAtividade}>
      <button type="submit" className={botaoPrimario}>
        + Nova atividade
      </button>
    </form>
  );
}
