import { headers } from "next/headers";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** Link de assinatura: as aulas de todas as turmas entram no Google Agenda e se atualizam sozinhas. */
export async function AssinarAgenda({
  perfilId,
  titulo = "Aulas na sua agenda",
  descricao = "Assine uma vez: os horários de todas as turmas aparecem e se atualizam sozinhos.",
}: {
  perfilId: string;
  titulo?: string;
  descricao?: string;
}) {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("perfil").select("agenda_token").eq("id", perfilId).maybeSingle();
  if (!data?.agenda_token) return null;

  const host = (await headers()).get("host") ?? "repasa.com.br";
  const webcal = `webcal://${host}/agenda/${data.agenda_token}.ics`;
  const google = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-linha p-5">
      <span>
        <span className="block font-bold">{titulo}</span>
        <span className="mt-0.5 block text-sm text-tinta-suave">{descricao}</span>
      </span>
      <span className="flex flex-wrap gap-4 text-sm font-bold">
        <a href={google} target="_blank" rel="noopener noreferrer" className="text-primaria hover:underline">
          Google Agenda
        </a>
        <a href={webcal} className="text-primaria hover:underline">
          Apple / Outlook
        </a>
      </span>
    </div>
  );
}
