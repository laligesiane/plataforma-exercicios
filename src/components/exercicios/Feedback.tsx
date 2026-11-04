import type { Resultado } from "@/lib/correcao";

export function Feedback({ resultado }: { resultado: Resultado | null }) {
  if (!resultado) return null;

  if (resultado.status === "certo") {
    return (
      <p className="mt-2 text-sm text-green-700 dark:text-green-400">
        Certo!{resultado.explicacao ? ` ${resultado.explicacao}` : ""}
      </p>
    );
  }

  if (resultado.status === "certo_com_aviso") {
    return <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">Certo, mas atenção: {resultado.aviso}</p>;
  }

  return <p className="mt-2 text-sm text-red-700 dark:text-red-400">Ainda não. {resultado.explicacao}</p>;
}
