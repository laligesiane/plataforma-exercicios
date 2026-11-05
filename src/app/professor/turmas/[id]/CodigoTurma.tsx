import { headers } from "next/headers";
import QRCode from "qrcode";
import { formatarCodigo } from "@/lib/codigoTurma";
import { trocarCodigoTurma } from "./actions-codigo";

/** Código e QR code para o aluno entrar na turma sem esperar o e-mail. */
export async function CodigoTurma({ turmaId, codigo }: { turmaId: string; codigo: string }) {
  const host = (await headers()).get("host") ?? "repasa.com.br";
  const protocolo = host.startsWith("localhost") ? "http" : "https";
  const link = `${protocolo}://${host}/t/${codigo}`;
  const qr = await QRCode.toString(link, { type: "svg", margin: 1, color: { dark: "#10233a", light: "#ffffff" } });

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div
        className="size-36 shrink-0 self-center overflow-hidden rounded-xl border border-linha bg-white p-1.5 [&>svg]:size-full"
        role="img"
        aria-label={`QR code para entrar na turma: ${link}`}
        dangerouslySetInnerHTML={{ __html: qr }}
      />
      <div className="min-w-0">
        <p className="text-sm text-tinta-suave">Mostre na aula. O aluno aponta a câmera para o QR code ou digita o código em Minha conta.</p>
        <p className="mt-2 font-mono text-3xl font-extrabold tracking-widest">{formatarCodigo(codigo)}</p>
        <p className="mt-1 text-sm break-all text-tinta-suave">{link.replace(/^https?:\/\//, "")}</p>
        <form action={trocarCodigoTurma} className="mt-2">
          <input type="hidden" name="turma_id" value={turmaId} />
          <button type="submit" className="text-sm font-bold text-tinta-suave hover:text-primaria">
            Trocar código (o antigo para de funcionar)
          </button>
        </form>
      </div>
    </div>
  );
}
