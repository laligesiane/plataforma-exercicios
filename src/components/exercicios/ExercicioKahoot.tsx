import { ehLinkKahoot } from "@/lib/atividades/modelo";
import { botaoPrimario } from "@/components/ui/estilos";

/** O Kahoot não deixa ser embutido em outras páginas, então abrimos o jogo numa aba nova. */
export function ExercicioKahoot({ link }: { link: string }) {
  if (!ehLinkKahoot(link)) {
    return <p className="text-sm text-tinta-suave">O professor ainda não colocou o link do Kahoot.</p>;
  }
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-suave p-5 text-center">
      <p className="text-sm text-tinta-suave">O jogo abre no site do Kahoot, numa aba nova. Depois é só voltar aqui.</p>
      <a href={link.trim()} target="_blank" rel="noopener noreferrer" className={botaoPrimario}>
        Jogar no Kahoot ↗
      </a>
    </div>
  );
}
