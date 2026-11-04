export type EstadoFormulario = { erro?: string; sucesso?: string } | null;

export function Mensagem({ estado }: { estado: EstadoFormulario }) {
  if (estado?.erro) {
    return (
      <p role="alert" className="rounded-xl bg-erro-fundo px-3.5 py-2.5 text-sm text-erro">
        {estado.erro}
      </p>
    );
  }
  if (estado?.sucesso) {
    return (
      <p role="status" className="rounded-xl bg-certo-fundo px-3.5 py-2.5 text-sm text-certo">
        {estado.sucesso}
      </p>
    );
  }
  return null;
}
